"""Motor de decisão: transforma detecções + qualidade + anomalia em PASS/FAIL/REVIEW.

Regras de segurança:
- Baixa confiança não é ausência de defeito: entre `review` e `fail` => REVIEW.
- PASS exige inspeção completa, qualidade OK, cápsula(s) localizada(s) e todas
  as condições de `pass_requires` (perfil, modelo e classes validados).
- Erros de software são tratados no pipeline e viram SYSTEM_ERROR, nunca PASS.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..config import DecisionRules, LightingProfile, Taxonomy
from ..inference.anomaly import AnomalyResult
from ..inference.roi import CapsuleRegion
from ..types import CapsuleResult, Decision, Detection, InspectionStatus, QualityReport, ResultCategory, worst_status

S = InspectionStatus
C = ResultCategory

CATEGORY_PRIORITY = {C.NORMAL_VALIDATED: 0, C.INCONCLUSIVE: 1, C.VISUAL_ANOMALY: 2,
                     C.DEFECT_CONFIRMED: 3, C.SYSTEM_ERROR: 4}


def _worst_category(*cats: ResultCategory) -> ResultCategory:
    return max(cats, key=lambda c: CATEGORY_PRIORITY[c])


def _ioa(defect: tuple[float, float, float, float], cap: tuple[float, float, float, float]) -> float:
    """Interseção sobre a área do defeito."""
    x1, y1 = max(defect[0], cap[0]), max(defect[1], cap[1])
    x2, y2 = min(defect[2], cap[2]), min(defect[3], cap[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area = max(1e-9, (defect[2] - defect[0]) * (defect[3] - defect[1]))
    return inter / area


def associate(defects: list[Detection], capsules: list[CapsuleRegion], min_ioa: float = 0.5
              ) -> tuple[dict[int, list[Detection]], list[Detection]]:
    """Associa cada defeito à cápsula que mais o contém."""
    out: dict[int, list[Detection]] = {i: [] for i in range(len(capsules))}
    orphans: list[Detection] = []
    for d in defects:
        best, best_v = -1, 0.0
        for i, c in enumerate(capsules):
            v = _ioa(d.box, c.box)
            if v > best_v:
                best, best_v = i, v
        if best >= 0 and best_v >= min_ioa:
            out[best].append(d)
        else:
            orphans.append(d)
    return out, orphans


@dataclass
class PassContext:
    profile: LightingProfile
    model_approved: bool


class DecisionEngine:
    def __init__(self, rules: DecisionRules, taxonomy: Taxonomy):
        self.rules = rules
        self.tax = taxonomy

    # ------------------------------------------------------------ bloqueios de PASS
    def pass_blockers(self, ctx: PassContext) -> list[str]:
        req = self.rules.pass_requires
        out = []
        if req.validated_profile and not ctx.profile.validated:
            out.append("PASS_BLOCKED: perfil de iluminação/produto não validado")
        if req.approved_model and not ctx.model_approved:
            out.append("PASS_BLOCKED: modelo não aprovado no registro")
        enabled_defects = [c for c in self.tax.classes if c.enabled and c.role == "defect"]
        if req.validated_critical_classes:
            nv = [c.key for c in enabled_defects if c.severity == "critical" and not c.validated]
            if nv:
                out.append(f"PASS_BLOCKED: classes críticas não validadas: {', '.join(nv)}")
        if req.required_acquisition_present:
            kinds = {s.kind for s in ctx.profile.steps}
            missing = [c.key for c in enabled_defects
                       if c.requires_acquisition and not (set(c.requires_acquisition) & kinds)]
            if missing:
                out.append("PASS_BLOCKED: aquisição do perfil não torna observáveis: " + ", ".join(missing))
        return out

    # ------------------------------------------------------------ decisão
    def decide(self, quality: QualityReport, detections: list[Detection], capsules: list[CapsuleRegion],
               ctx: PassContext, anomalies: dict[int, AnomalyResult] | None = None) -> Decision:
        r = self.rules
        reasons: list[str] = []
        g_status, g_cat = S.PASS, C.NORMAL_VALIDATED

        if not quality.ok:
            g_status = S(r.quality_failure_action)
            g_cat = C.INCONCLUSIVE if g_status == S.REVIEW else C.SYSTEM_ERROR
            reasons += [f"QUALITY: {x}" for x in quality.reasons]

        n = len(capsules)
        lo, hi = r.expected_capsules.get("min", 1), r.expected_capsules.get("max", 1)
        if n < lo or n > hi:
            g_status = worst_status(g_status, S.REVIEW)
            g_cat = _worst_category(g_cat, C.INCONCLUSIVE)
            reasons.append(f"CAPSULE_COUNT: {n} localizadas, esperado [{lo}, {hi}]")

        defects = [d for d in detections if d.class_name != r.capsule_class]
        by_cap, orphans = associate(defects, capsules)
        for d in orphans:
            if d.confidence >= r.thresholds_for(d.class_name).review:
                act = S(r.unassociated_defect_action)
                g_status = worst_status(g_status, act)
                g_cat = _worst_category(g_cat, C.INCONCLUSIVE if act != S.FAIL else C.DEFECT_CONFIRMED)
                reasons.append(f"UNASSOCIATED_DEFECT: {d.class_name} conf={d.confidence:.2f}")

        blockers = self.pass_blockers(ctx)
        results: list[CapsuleResult] = []
        for i, cap in enumerate(capsules):
            st, cat, why, kept = S.PASS, C.NORMAL_VALIDATED, [], []
            if cap.touches_border:
                st, cat = worst_status(st, S.REVIEW), _worst_category(cat, C.INCONCLUSIVE)
                why.append("CAPSULE_AT_BORDER: cápsula possivelmente incompleta no quadro")
            if cap.area_fraction and cap.area_fraction < r.quality.min_capsule_area_fraction:
                st, cat = worst_status(st, S.REVIEW), _worst_category(cat, C.INCONCLUSIVE)
                why.append(f"CAPSULE_TOO_SMALL: fração {cap.area_fraction:.4f}")
            for d in sorted(by_cap.get(i, []), key=lambda x: -x.confidence):
                spec = self.tax.get(d.class_name)
                th = r.thresholds_for(d.class_name)
                if spec is None or not spec.enabled:
                    st, cat = worst_status(st, S.REVIEW), _worst_category(cat, C.INCONCLUSIVE)
                    why.append(f"UNKNOWN_CLASS: {d.class_name}")
                    kept.append(d)
                    continue
                if d.confidence >= th.fail:
                    act = S(r.severity_actions.get(spec.severity, "FAIL"))
                    if act == S.FAIL:
                        c2 = C.DEFECT_CONFIRMED if spec.validated else C.INCONCLUSIVE
                        why.append(f"DEFECT: {d.class_name} conf={d.confidence:.2f} >= {th.fail}"
                                   + ("" if spec.validated else " (classe não validada: rejeição conservadora)"))
                    else:
                        c2 = C.INCONCLUSIVE
                        why.append(f"DEFECT_MINOR: {d.class_name} conf={d.confidence:.2f} -> {act.value}")
                    st, cat = worst_status(st, act), _worst_category(cat, c2)
                    kept.append(d)
                elif d.confidence >= th.review:
                    st, cat = worst_status(st, S.REVIEW), _worst_category(cat, C.INCONCLUSIVE)
                    why.append(f"UNCERTAIN: {d.class_name} conf={d.confidence:.2f} em [{th.review}, {th.fail})")
                    kept.append(d)
            if len(kept) > r.max_defects_per_capsule_before_review:
                st, cat = worst_status(st, S.REVIEW), _worst_category(cat, C.INCONCLUSIVE)
                why.append(f"TOO_MANY_DETECTIONS: {len(kept)}")
            a = (anomalies or {}).get(i)
            if a is not None and a.is_anomalous:
                act = S(r.anomaly_action)
                st, cat = worst_status(st, act), _worst_category(cat, C.VISUAL_ANOMALY)
                why.append(f"ANOMALY: escore {a.score:.3f} > limiar {a.threshold:.3f}")
            if st == S.PASS and blockers:
                st, cat = S.REVIEW, C.INCONCLUSIVE
                why += blockers
            results.append(CapsuleResult(i, cap.box, cap.confidence, st, cat, kept, why))

        status, cat = g_status, g_cat
        for c in results:
            status = worst_status(status, c.status)
            cat = _worst_category(cat, c.category)
        if status == S.PASS and blockers:  # sem cápsulas ainda assim não passa
            status, cat = S.REVIEW, C.INCONCLUSIVE
            reasons += blockers
        if not results and status == S.PASS:  # defesa extra: nada inspecionado
            status, cat = S.REVIEW, C.INCONCLUSIVE
            reasons.append("NOTHING_INSPECTED")
        return Decision(status, cat, reasons, results)
