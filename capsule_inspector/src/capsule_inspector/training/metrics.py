"""Métricas de detecção independentes de backend (numpy puro).

Calculadas a partir de listas de predições e verdades — o mesmo código avalia
PyTorch, ONNX FP32, ONNX INT8 e NCNN, o que permite medir se a exportação ou a
quantização degradou defeitos pequenos.

Convenções:
- AP: interpolação de 101 pontos (COCO); mAP50-95 em IoU 0.50:0.05:0.95.
- Ponto de operação: limiar de confiança por classe (ex.: limiar de revisão).
- Tamanho: pequeno < 32² px, médio < 96² px, grande >= 96² px (área da caixa GT
  na resolução ORIGINAL da imagem).
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import numpy as np

from ..inference.postprocess import box_iou

IOU_THRESHOLDS = np.linspace(0.5, 0.95, 10)
SIZE_BUCKETS = (("small", 0, 32 ** 2), ("medium", 32 ** 2, 96 ** 2), ("large", 96 ** 2, float("inf")))


@dataclass
class ImageEval:
    key: str
    width: int
    height: int
    gt: list[tuple[int, tuple[float, float, float, float]]]                 # (classe, xyxy)
    preds: list[tuple[int, float, tuple[float, float, float, float]]]       # (classe, conf, xyxy)
    meta: dict[str, str] = field(default_factory=dict)


def _ap101(recall: np.ndarray, precision: np.ndarray) -> float:
    """AP no estilo COCO: média, em 101 níveis de recall, da precisão máxima com recall >= nível."""
    if recall.size == 0:
        return 0.0
    env = np.flip(np.maximum.accumulate(np.flip(precision)))
    x = np.linspace(0, 1, 101)
    idx = np.searchsorted(recall, x, side="left")
    q = np.where(idx < len(env), env[np.minimum(idx, len(env) - 1)], 0.0)
    return float(q.mean())


def _match_class(images: list[ImageEval], c: int, iou_thr: float
                 ) -> tuple[np.ndarray, np.ndarray, int]:
    """Retorna (conf ordenadas, tp booleanos, n_gt) para uma classe e um IoU."""
    confs, tps = [], []
    n_gt = 0
    for im in images:
        g = np.array([b for k, b in im.gt if k == c], np.float64).reshape(-1, 4)
        p = [(s, b) for k, s, b in im.preds if k == c]
        n_gt += len(g)
        if not p:
            continue
        p.sort(key=lambda x: -x[0])
        pb = np.array([b for _, b in p], np.float64).reshape(-1, 4)
        ious = box_iou(pb, g) if len(g) else np.zeros((len(pb), 0))
        used = np.zeros(len(g), bool)
        for i, (s, _) in enumerate(p):
            confs.append(s)
            if len(g):
                cand = np.where(~used, ious[i], -1)
                j = int(cand.argmax())
                if cand[j] >= iou_thr:
                    used[j] = True
                    tps.append(True)
                    continue
            tps.append(False)
    order = np.argsort(-np.array(confs)) if confs else np.array([], int)
    return np.array(confs)[order], np.array(tps, bool)[order], n_gt


def ap_per_class(images: list[ImageEval], num_classes: int) -> dict[int, dict[str, Any]]:
    out: dict[int, dict[str, Any]] = {}
    for c in range(num_classes):
        aps = []
        curve = None
        n_gt = 0
        for t in IOU_THRESHOLDS:
            conf, tp, n_gt = _match_class(images, c, float(t))
            if n_gt == 0:
                aps.append(float("nan"))
                continue
            ctp, cfp = np.cumsum(tp), np.cumsum(~tp)
            rec = ctp / n_gt
            prec = ctp / np.maximum(ctp + cfp, 1e-9)
            aps.append(_ap101(rec, prec))
            if abs(t - 0.5) < 1e-9:
                curve = {"confidence": conf.tolist(), "precision": prec.tolist(), "recall": rec.tolist()}
        out[c] = {"n_gt": n_gt, "ap50": aps[0], "ap50_95": float(np.nanmean(aps)) if n_gt else float("nan"),
                  "pr_curve": curve}
    return out


def operating_point(images: list[ImageEval], num_classes: int, conf_thr: dict[int, float],
                    iou_thr: float = 0.5) -> dict[int, dict[str, float]]:
    """P/R/F1/FN/FP por classe e recall por tamanho, no limiar de confiança dado."""
    res: dict[int, dict[str, float]] = {}
    n_img = max(1, len(images))
    for c in range(num_classes):
        thr = conf_thr.get(c, 0.25)
        tp = fp = 0
        n_gt = 0
        size_tot = defaultdict(int)
        size_hit = defaultdict(int)
        for im in images:
            g = [b for k, b in im.gt if k == c]
            p = sorted([(s, b) for k, s, b in im.preds if k == c and s >= thr], key=lambda x: -x[0])
            n_gt += len(g)
            ga = np.array(g, np.float64).reshape(-1, 4)
            used = np.zeros(len(g), bool)
            if p and len(g):
                ious = box_iou(np.array([b for _, b in p], np.float64), ga)
                for i in range(len(p)):
                    cand = np.where(~used, ious[i], -1)
                    j = int(cand.argmax())
                    if cand[j] >= iou_thr:
                        used[j] = True
                        tp += 1
                    else:
                        fp += 1
            else:
                fp += len(p)
            for j, b in enumerate(g):
                area = (b[2] - b[0]) * (b[3] - b[1])
                for name, lo, hi in SIZE_BUCKETS:
                    if lo <= area < hi:
                        size_tot[name] += 1
                        size_hit[name] += int(used[j])
        fn = n_gt - tp
        prec = tp / (tp + fp) if tp + fp else float("nan")
        rec = tp / n_gt if n_gt else float("nan")
        f1 = 2 * prec * rec / (prec + rec) if n_gt and tp + fp and (prec + rec) > 0 else float("nan")
        res[c] = {"threshold": thr, "n_gt": n_gt, "tp": tp, "fp": fp, "fn": fn, "precision": prec,
                  "recall": rec, "f1": f1, "fn_rate": fn / n_gt if n_gt else float("nan"),
                  "fp_per_image": fp / n_img,
                  "recall_by_size": {k: (size_hit[k] / size_tot[k] if size_tot[k] else None)
                                     for k, _, _ in SIZE_BUCKETS},
                  "n_by_size": {k: size_tot[k] for k, _, _ in SIZE_BUCKETS}}
    return res


def confusion_matrix(images: list[ImageEval], num_classes: int, conf_thr: float = 0.25,
                     iou_thr: float = 0.5) -> np.ndarray:
    """Matriz (nc+1)x(nc+1): linhas = predito, colunas = verdade; último índice = fundo."""
    m = np.zeros((num_classes + 1, num_classes + 1), np.int64)
    bg = num_classes
    for im in images:
        p = sorted([x for x in im.preds if x[1] >= conf_thr], key=lambda x: -x[1])
        g = im.gt
        used = np.zeros(len(g), bool)
        if p and g:
            ious = box_iou(np.array([b for _, _, b in p], np.float64), np.array([b for _, b in g], np.float64))
        for i, (pc, _, _) in enumerate(p):
            j = -1
            if g:
                cand = np.where(~used, ious[i], -1)
                j = int(cand.argmax())
                if cand[j] < iou_thr:
                    j = -1
            if j >= 0:
                used[j] = True
                m[pc, g[j][0]] += 1
            else:
                m[pc, bg] += 1
        for j, (gc, _) in enumerate(g):
            if not used[j]:
                m[bg, gc] += 1
    return m


def decision_metrics(images: list[ImageEval], decide: Callable[[ImageEval], str],
                     defect_classes: set[int]) -> dict[str, Any]:
    """Métricas no nível da unidade: escape (defeituosa aprovada) e falsa rejeição."""
    n_def = n_good = esc = frj = rev_def = rev_good = 0
    escapes: list[str] = []
    for im in images:
        defective = any(k in defect_classes for k, _ in im.gt)
        st = decide(im)
        if defective:
            n_def += 1
            if st == "PASS":
                esc += 1
                escapes.append(im.key)
            elif st == "REVIEW":
                rev_def += 1
        else:
            n_good += 1
            if st == "FAIL":
                frj += 1
            elif st == "REVIEW":
                rev_good += 1
    return {
        "n_defective": n_def, "n_good": n_good,
        "escape_rate": esc / n_def if n_def else None,
        "false_reject_rate": frj / n_good if n_good else None,
        "review_rate_defective": rev_def / n_def if n_def else None,
        "review_rate_good": rev_good / n_good if n_good else None,
        "escapes": escapes[:50],
    }


def calibrate_thresholds(images: list[ImageEval], num_classes: int, target_recall: dict[int, float],
                         target_precision: dict[int, float], iou_thr: float = 0.5) -> dict[int, dict[str, Any]]:
    """Sugere limiares por classe a partir da VALIDAÇÃO (não do teste).

    review = maior limiar com recall >= alvo; fail = menor limiar com precisão >= alvo.
    """
    out = {}
    for c in range(num_classes):
        conf, tp, n_gt = _match_class(images, c, iou_thr)
        if n_gt == 0 or conf.size == 0:
            out[c] = {"review": None, "fail": None, "n_gt": n_gt, "note": "dados insuficientes"}
            continue
        ctp, cfp = np.cumsum(tp), np.cumsum(~tp)
        rec, prec = ctp / n_gt, ctp / np.maximum(ctp + cfp, 1e-9)
        tr, tp_ = target_recall.get(c, 0.95), target_precision.get(c, 0.9)
        ok_r = np.where(rec >= tr)[0]
        review = float(conf[ok_r[0]]) if ok_r.size else None
        ok_p = np.where(prec >= tp_)[0]
        fail = float(conf[ok_p[-1]]) if ok_p.size else None
        note = []
        if review is None:
            note.append(f"recall alvo {tr} inatingível (máx {rec.max():.3f})")
        if fail is None:
            note.append(f"precisão alvo {tp_} inatingível")
        if review is not None and fail is not None and fail < review:
            fail = review
        if n_gt < 30:
            note.append(f"n={n_gt} < 30: limiar estatisticamente instável")
        out[c] = {"review": review, "fail": fail, "n_gt": n_gt, "max_recall": float(rec.max()),
                  "note": "; ".join(note)}
    return out


def regression_check(new: dict[str, Any], ref: dict[str, Any], recall_tol: float = 0.02,
                     map_tol: float = 0.02, escape_tol: float = 0.0) -> dict[str, Any]:
    """Compara dois relatórios de avaliação no MESMO conjunto de teste."""
    checks = []
    if new.get("dataset_fingerprint") != ref.get("dataset_fingerprint"):
        return {"passed": False, "checks": [{"name": "same_test_set", "passed": False,
                                             "detail": "relatórios usam conjuntos de teste diferentes"}]}
    for cname, cn in new["per_class"].items():
        cr = ref["per_class"].get(cname)
        if not cr or cr["operating"]["n_gt"] == 0:
            continue
        rn, rr = cn["operating"]["recall"], cr["operating"]["recall"]
        if rn is None or rr is None:
            checks.append({"name": f"recall:{cname}", "passed": False, "new": rn, "ref": rr,
                           "detail": "recall indefinido"})
            continue
        ok = rn >= rr - recall_tol
        checks.append({"name": f"recall:{cname}", "passed": bool(ok), "new": rn, "ref": rr})
        for size in ("small",):
            sn = cn["operating"]["recall_by_size"].get(size)
            sr = cr["operating"]["recall_by_size"].get(size)
            if sn is not None and sr is not None:
                checks.append({"name": f"recall_{size}:{cname}", "passed": bool(sn >= sr - recall_tol),
                               "new": sn, "ref": sr})
    mn, mr = new["summary"]["map50"], ref["summary"]["map50"]
    checks.append({"name": "map50", "passed": bool(mn is not None and mr is not None and mn >= mr - map_tol),
                   "new": mn, "ref": mr})
    en, er = new["decision"].get("escape_rate"), ref["decision"].get("escape_rate")
    if en is not None and er is not None:
        checks.append({"name": "escape_rate", "passed": bool(en <= er + escape_tol), "new": en, "ref": er})
    return {"passed": all(c["passed"] for c in checks), "checks": checks,
            "tolerances": {"recall": recall_tol, "map50": map_tol, "escape": escape_tol}}
