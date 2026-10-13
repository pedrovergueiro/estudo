"""Avaliação de um modelo (qualquer backend) num split independente.

Gera relatório com: mAP50, mAP50-95, P/R/F1/FN/FP por classe no ponto de
operação, recall por tamanho (defeitos pequenos), matriz de confusão, curvas
PR, exemplos de FP/FN, métricas por estrato (acabamento, cor, lote,
iluminação) e métricas de decisão (taxa de escape e de falsa rejeição).
Estratos sem dados suficientes são marcados NOT_VALIDATED.
"""

from __future__ import annotations

import hashlib
import json
import math
from collections import defaultdict
from collections.abc import Callable
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import PassRequires, Settings
from ..dataset.hashing import file_sha256
from ..dataset.metadata import STRATA_COLUMNS, rel_key
from ..dataset.report import color_for
from ..dataset.yolo_io import label_path_for, read_label_file
from ..decision.rules import DecisionEngine, PassContext
from ..inference.roi import regions_from_detections
from ..types import Detection, QualityReport
from .metrics import ImageEval, ap_per_class, calibrate_thresholds, confusion_matrix, decision_metrics, operating_point

MIN_STRATUM_IMAGES = 30
MIN_STRATUM_DEFECTS = 10
EXPECTED_STRATA = {"finish": ["opaque", "translucent", "transparent"]}


def _nan_to_none(x: Any) -> Any:
    if isinstance(x, float) and (math.isnan(x) or math.isinf(x)):
        return None
    if isinstance(x, dict):
        return {k: _nan_to_none(v) for k, v in x.items()}
    if isinstance(x, list):
        return [_nan_to_none(v) for v in x]
    return x


def load_ground_truth(img_path: Path, width: int, height: int) -> list[tuple[int, tuple[float, float, float, float]]]:
    lp = label_path_for(img_path)
    if not lp.exists():
        return []
    return [(a.class_id, a.xyxy(width, height)) for a in read_label_file(lp)]


def collect_predictions(predict: Callable[[np.ndarray], list[Detection]], image_paths: list[Path], root: Path,
                        metadata: dict[str, dict[str, str]] | None = None,
                        preprocess: Callable[[np.ndarray], np.ndarray] | None = None,
                        timings: list[float] | None = None) -> list[ImageEval]:
    import time
    out = []
    for p in image_paths:
        img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise RuntimeError(f"imagem ilegível no conjunto de avaliação: {p}")
        h, w = img.shape[:2]
        x = preprocess(img) if preprocess else img
        t0 = time.perf_counter()
        dets = predict(x)
        if timings is not None:
            timings.append((time.perf_counter() - t0) * 1000)
        key = rel_key(p, root)
        meta = dict((metadata or {}).get(key, {}))
        meta["_path"] = str(p)
        out.append(ImageEval(key, w, h, load_ground_truth(p, w, h),
                             [(d.class_id, d.confidence, d.box) for d in dets], meta))
    return out


def dataset_fingerprint(images: list[ImageEval]) -> str:
    h = hashlib.sha256()
    for im in sorted(images, key=lambda i: i.key):
        h.update(im.key.encode())
        h.update(file_sha256(Path(im.meta["_path"])).encode())
    return h.hexdigest()


def make_decider(settings: Settings, names: list[str], anomaly=None) -> Callable[[ImageEval], str]:
    """Decisão do motor de regras com `pass_requires` desligado (avalia o modelo, não a validação).

    Com `anomaly` (PatchCoreLite), cada cápsula também passa pelo Modo C, como no pipeline.
    """
    rules = settings.decision.model_copy(deep=True)
    rules.pass_requires = PassRequires(validated_profile=False, approved_model=False,
                                       validated_critical_classes=False, required_acquisition_present=False)
    engine = DecisionEngine(rules, settings.taxonomy)
    ctx = PassContext(settings.active_profile, True)
    ok = QualityReport(True)

    def decide(im: ImageEval) -> str:
        dets = [Detection(c, names[c], s, b) for c, s, b in im.preds]
        regions = regions_from_detections(dets, rules.capsule_class, rules.capsule_min_confidence,
                                          (im.height, im.width), rules.quality.border_margin_px)
        anomalies = None
        if anomaly is not None and regions:
            from ..inference.anomaly import normalize_crop
            img = cv2.imdecode(np.fromfile(im.meta["_path"], dtype=np.uint8), cv2.IMREAD_COLOR)
            anomalies = {i: anomaly.score(normalize_crop(img, r.box)) for i, r in enumerate(regions)}
        return engine.decide(ok, dets, regions, ctx, anomalies).status.value
    return decide


def build_report(images: list[ImageEval], settings: Settings, names: list[str], model: dict[str, Any],
                 split: str, latency_ms: list[float] | None = None, anomaly=None) -> dict[str, Any]:
    nc = len(names)
    rules = settings.decision
    review_thr = {i: rules.thresholds_for(n).review for i, n in enumerate(names)}
    fail_thr = {i: rules.thresholds_for(n).fail for i, n in enumerate(names)}
    capsule_id = names.index(rules.capsule_class) if rules.capsule_class in names else -1
    defect_ids = {i for i in range(nc) if i != capsule_id}
    ap = ap_per_class(images, nc)
    op_review = operating_point(images, nc, review_thr)
    op_fail = operating_point(images, nc, fail_thr)
    per_class = {}
    for i, n in enumerate(names):
        per_class[n] = {"ap50": ap[i]["ap50"], "ap50_95": ap[i]["ap50_95"], "operating": op_review[i],
                        "at_fail_threshold": op_fail[i], "pr_curve": ap[i]["pr_curve"]}
    valid = [i for i in range(nc) if ap[i]["n_gt"] > 0]
    tp = sum(op_review[i]["tp"] for i in defect_ids)
    fp = sum(op_review[i]["fp"] for i in defect_ids)
    fn = sum(op_review[i]["fn"] for i in defect_ids)
    p = tp / (tp + fp) if tp + fp else float("nan")
    r = tp / (tp + fn) if tp + fn else float("nan")
    summary = {
        "n_images": len(images),
        "map50": float(np.mean([ap[i]["ap50"] for i in valid])) if valid else float("nan"),
        "map50_95": float(np.mean([ap[i]["ap50_95"] for i in valid])) if valid else float("nan"),
        "defects_precision": p, "defects_recall": r,
        "defects_f1": 2 * p * r / (p + r) if tp and (p + r) > 0 else float("nan"),
        "defects_fn_rate": fn / (tp + fn) if tp + fn else float("nan"),
        "classes_without_test_data": [names[i] for i in range(nc) if ap[i]["n_gt"] == 0],
    }
    if latency_ms:
        summary["latency_ms_p50"] = float(np.percentile(latency_ms, 50))
        summary["latency_ms_p95"] = float(np.percentile(latency_ms, 95))
    decider = make_decider(settings, names)
    decision = decision_metrics(images, decider, defect_ids)
    decision_with_anomaly = None
    if anomaly is not None:
        decision_with_anomaly = decision_metrics(images, make_decider(settings, names, anomaly), defect_ids)

    strata: dict[str, dict[str, Any]] = {}
    for col in STRATA_COLUMNS:
        groups: dict[str, list[ImageEval]] = defaultdict(list)
        for im in images:
            v = im.meta.get(col, "")
            if v:
                groups[v].append(im)
        values = sorted(set(groups) | set(EXPECTED_STRATA.get(col, [])))
        if not values:
            continue
        strata[col] = {}
        for v in values:
            sub = groups.get(v, [])
            n_def = sum(1 for im in sub for k, _ in im.gt if k in defect_ids)
            entry: dict[str, Any] = {"n_images": len(sub), "n_defect_instances": n_def}
            if len(sub) < MIN_STRATUM_IMAGES or n_def < MIN_STRATUM_DEFECTS:
                entry["status"] = "NOT_VALIDATED"
                entry["reason"] = (f"dados insuficientes (mínimo {MIN_STRATUM_IMAGES} imagens e "
                                   f"{MIN_STRATUM_DEFECTS} defeitos)")
            else:
                entry["status"] = "EVALUATED"
            if sub:
                op = operating_point(sub, nc, review_thr)
                entry["recall_by_class"] = {names[i]: op[i]["recall"] for i in defect_ids if op[i]["n_gt"]}
                entry["decision"] = decision_metrics(sub, decider, defect_ids)
            strata[col][v] = entry

    cm = confusion_matrix(images, nc, conf_thr=min(review_thr.values()))
    report = {
        "split": split, "model": model, "model_sha256": model.get("sha256"),
        "class_names": names, "dataset_fingerprint": dataset_fingerprint(images),
        "summary": summary, "per_class": per_class, "decision": decision,
        "decision_with_anomaly": decision_with_anomaly, "strata": strata,
        "confusion_matrix": {"labels": names + ["background"], "rows_pred_cols_true": cm.tolist(),
                             "conf_threshold": min(review_thr.values())},
        "config": {"versions": settings.versions(), "hash": settings.inspection_config_hash()},
        "warnings": [],
    }
    if any(im.meta.get("profile") == "synthetic" for im in images):
        report["warnings"].append("CONJUNTO SINTÉTICO: métricas sem valor de validação")
    return _nan_to_none(report)


def calibration_suggestion(images: list[ImageEval], settings: Settings, names: list[str],
                           critical_recall: float = 0.99, other_recall: float = 0.95,
                           target_precision: float = 0.90) -> dict[str, Any]:
    tr = {}
    for i, n in enumerate(names):
        spec = settings.taxonomy.get(n)
        tr[i] = critical_recall if spec and spec.severity == "critical" else other_recall
    cal = calibrate_thresholds(images, len(names), tr, {i: target_precision for i in range(len(names))})
    return {names[i]: v for i, v in cal.items() if names[i] != settings.decision.capsule_class}


# ------------------------------------------------------------------ saída
def confusion_png(cm: np.ndarray, labels: list[str], out: Path) -> Path:
    n = len(labels)
    cell, left, top = 46, 170, 150
    img = np.full((top + n * cell + 20, left + n * cell + 20, 3), 255, np.uint8)
    norm = cm / np.maximum(cm.sum(0, keepdims=True), 1)
    for i in range(n):
        for j in range(n):
            v = norm[i, j]
            col = (int(255 - 200 * v), int(255 - 120 * v), 255)
            x, y = left + j * cell, top + i * cell
            cv2.rectangle(img, (x, y), (x + cell, y + cell), col, -1)
            cv2.rectangle(img, (x, y), (x + cell, y + cell), (200, 200, 200), 1)
            if cm[i, j]:
                cv2.putText(img, str(int(cm[i, j])), (x + 6, y + 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1)
        cv2.putText(img, labels[i][:20], (5, top + i * cell + 28), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 0), 1)
    for j in range(n):
        tmp = np.full((cell, top - 10, 3), 255, np.uint8)
        cv2.putText(tmp, labels[j][:18], (2, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 0), 1)
        rot = cv2.rotate(tmp, cv2.ROTATE_90_COUNTERCLOCKWISE)
        img[0:top - 10, left + j * cell:left + (j + 1) * cell] = rot
    cv2.putText(img, "linhas: predito / colunas: verdade", (5, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1)
    cv2.imwrite(str(out), img)
    return out


def pr_png(per_class: dict[str, Any], out: Path) -> Path:
    W, H, m = 640, 520, 60
    img = np.full((H, W, 3), 255, np.uint8)
    cv2.rectangle(img, (m, 20), (W - 20, H - m), (0, 0, 0), 1)
    for k in range(0, 11):
        x = m + int((W - 20 - m) * k / 10)
        y = H - m - int((H - m - 20) * k / 10)
        cv2.putText(img, f"{k / 10:.1f}", (x - 10, H - m + 18), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 1)
        cv2.putText(img, f"{k / 10:.1f}", (m - 32, y + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 1)
    cv2.putText(img, "recall", (W // 2, H - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    cv2.putText(img, "precisao", (5, 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    for i, (n, c) in enumerate(per_class.items()):
        cur = c.get("pr_curve")
        if not cur or not cur["recall"]:
            continue
        pts = [(m + int((W - 20 - m) * r), H - m - int((H - m - 20) * p))
               for r, p in zip(cur["recall"], cur["precision"])]
        cv2.polylines(img, [np.array(pts, np.int32)], False, color_for(i), 2, cv2.LINE_AA)
        cv2.putText(img, f"{n} AP50={c['ap50'] or 0:.2f}", (W - 220, 40 + 16 * i), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, color_for(i), 1)
    cv2.imwrite(str(out), img)
    return out


def error_gallery(images: list[ImageEval], names: list[str], thr: dict[int, float], out: Path,
                  kind: str = "fn", limit: int = 24, tile: int = 128) -> tuple[Path | None, list[dict]]:
    from ..inference.postprocess import box_iou
    items = []
    for im in images:
        g = [(k, b) for k, b in im.gt]
        p = [(k, s, b) for k, s, b in im.preds if s >= thr.get(k, 0.25)]
        if kind == "fn":
            for k, b in g:
                same = [pb for pk, _, pb in p if pk == k]
                hit = len(same) and box_iou(np.array([b]), np.array(same)).max() >= 0.5
                if not hit:
                    items.append({"image": im.key, "class": names[k], "box": [round(v, 1) for v in b],
                                  "_path": im.meta["_path"]})
        else:
            for k, s, b in p:
                same = [gb for gk, gb in g if gk == k]
                hit = len(same) and box_iou(np.array([b]), np.array(same)).max() >= 0.5
                if not hit:
                    items.append({"image": im.key, "class": names[k], "confidence": round(s, 3),
                                  "box": [round(v, 1) for v in b], "_path": im.meta["_path"]})
    if kind == "fp":
        items.sort(key=lambda x: -x["confidence"])
    sel = items[:limit]
    if not sel:
        return None, []
    cols = 6
    rows = int(np.ceil(len(sel) / cols))
    canvas = np.full((rows * (tile + 18), cols * tile, 3), 255, np.uint8)
    for i, it in enumerate(sel):
        img = cv2.imdecode(np.fromfile(it["_path"], dtype=np.uint8), cv2.IMREAD_COLOR)
        x1, y1, x2, y2 = it["box"]
        pad = max(16, int(0.6 * max(x2 - x1, y2 - y1)))
        cx1, cy1 = max(0, int(x1) - pad), max(0, int(y1) - pad)
        cx2, cy2 = min(img.shape[1], int(x2) + pad), min(img.shape[0], int(y2) + pad)
        crop = img[cy1:cy2, cx1:cx2].copy()
        cv2.rectangle(crop, (int(x1) - cx1, int(y1) - cy1), (int(x2) - cx1, int(y2) - cy1),
                      (0, 0, 255) if kind == "fn" else (0, 165, 255), 1)
        s = tile / max(crop.shape[:2])
        crop = cv2.resize(crop, (max(1, int(crop.shape[1] * s)), max(1, int(crop.shape[0] * s))))
        r, c = divmod(i, cols)
        y0 = r * (tile + 18)
        canvas[y0:y0 + crop.shape[0], c * tile:c * tile + crop.shape[1]] = crop
        label = it["class"] + (f" {it['confidence']:.2f}" if "confidence" in it else "")
        cv2.putText(canvas, label[:20], (c * tile + 2, y0 + tile + 13), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 0), 1)
    cv2.imwrite(str(out), canvas)
    return out, [{k: v for k, v in it.items() if k != "_path"} for it in items[:200]]


def write_report(report: dict[str, Any], images: list[ImageEval], settings: Settings, out_dir: Path) -> dict[str, Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    names = report["class_names"]
    thr = {i: settings.decision.thresholds_for(n).review for i, n in enumerate(names)}
    cm = np.array(report["confusion_matrix"]["rows_pred_cols_true"])
    paths = {"confusion": confusion_png(cm, report["confusion_matrix"]["labels"], out_dir / "confusion_matrix.png"),
             "pr": pr_png(report["per_class"], out_dir / "pr_curves.png")}
    fn_png, fn_list = error_gallery(images, names, thr, out_dir / "false_negatives.jpg", "fn")
    fp_png, fp_list = error_gallery(images, names, thr, out_dir / "false_positives.jpg", "fp")
    report["false_negatives"], report["false_positives"] = fn_list, fp_list
    jp = out_dir / "evaluation.json"
    slim = json.loads(json.dumps(report))
    jp.write_text(json.dumps(slim, indent=2, ensure_ascii=False), encoding="utf-8")
    paths["json"] = jp
    paths["markdown"] = write_markdown(report, out_dir / "evaluation.md", fn_png is not None, fp_png is not None)
    return paths


def _f(x: Any, nd: int = 3) -> str:
    return "—" if x is None else (f"{x:.{nd}f}" if isinstance(x, float) else str(x))


def write_markdown(rep: dict[str, Any], out: Path, has_fn: bool, has_fp: bool) -> Path:
    s, d = rep["summary"], rep["decision"]
    L = [f"# Relatório de avaliação — split `{rep['split']}`", ""]
    for w in rep.get("warnings", []):
        L += [f"> **AVISO:** {w}", ""]
    L += [f"- Modelo: `{rep['model'].get('model_id')}` — backend `{rep['model'].get('backend')}` — "
          f"SHA-256 `{(rep.get('model_sha256') or '')[:16]}`",
          f"- Imagens: {s['n_images']} — impressão digital do conjunto `{rep['dataset_fingerprint'][:16]}`",
          f"- mAP50 **{_f(s['map50'])}** · mAP50-95 **{_f(s['map50_95'])}**",
          f"- Defeitos (limiar de revisão): precisão {_f(s['defects_precision'])} · recall {_f(s['defects_recall'])}"
          f" · F1 {_f(s['defects_f1'])} · taxa FN {_f(s['defects_fn_rate'])}",
          f"- Decisão: escape (defeituosa aprovada) **{_f(d['escape_rate'])}** · falsa rejeição "
          f"{_f(d['false_reject_rate'])} · revisão (defeituosas) {_f(d['review_rate_defective'])} · "
          f"revisão (boas) {_f(d['review_rate_good'])}"]
    da = rep.get("decision_with_anomaly")
    if da:
        L.append(f"- Decisão **com Modo C**: escape {_f(da['escape_rate'])} · falsa rejeição "
                 f"{_f(da['false_reject_rate'])} · revisão (defeituosas) {_f(da['review_rate_defective'])} · "
                 f"revisão (boas) {_f(da['review_rate_good'])} — habilite o Modo C só se o ganho compensar")
    if s.get("latency_ms_p50") is not None:
        L.append(f"- Latência do modelo nesta máquina: p50 {_f(s['latency_ms_p50'], 1)} ms · p95 {_f(s['latency_ms_p95'], 1)} ms")
    if s["classes_without_test_data"]:
        L.append(f"- **Classes sem dados de teste (NÃO VALIDADAS):** {', '.join(s['classes_without_test_data'])}")
    L += ["", "## Por classe (ponto de operação = limiar de revisão)", "",
          "| Classe | GT | AP50 | AP50-95 | Precisão | Recall | F1 | FN | FP | Recall pequenos (n) |",
          "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for n, c in rep["per_class"].items():
        o = c["operating"]
        L.append(f"| {n} | {o['n_gt']} | {_f(c['ap50'])} | {_f(c['ap50_95'])} | {_f(o['precision'])} | "
                 f"{_f(o['recall'])} | {_f(o['f1'])} | {o['fn']} | {o['fp']} | "
                 f"{_f(o['recall_by_size'].get('small'))} ({o['n_by_size'].get('small', 0)}) |")
    L += ["", "## Por estrato de aquisição", ""]
    for col, vals in rep["strata"].items():
        L += [f"### {col}", "", "| Valor | Imagens | Defeitos | Estado | Escape | Falsa rejeição |", "|---|---:|---:|---|---:|---:|"]
        for v, e in vals.items():
            dd = e.get("decision", {})
            L.append(f"| {v} | {e['n_images']} | {e['n_defect_instances']} | {e['status']} | "
                     f"{_f(dd.get('escape_rate'))} | {_f(dd.get('false_reject_rate'))} |")
        L.append("")
    if rep.get("calibration"):
        L += ["## Limiares sugeridos (calibrados na validação — revisar antes de aplicar)", "",
              "| Classe | review | fail | recall máx | nota |", "|---|---:|---:|---:|---|"]
        for n, c in rep["calibration"].items():
            L.append(f"| {n} | {_f(c.get('review'))} | {_f(c.get('fail'))} | {_f(c.get('max_recall'))} | {c.get('note', '')} |")
        L.append("")
    if rep.get("regression"):
        rg = rep["regression"]
        L += [f"## Regressão contra referência: **{'APROVADA' if rg['passed'] else 'REPROVADA'}**", ""]
        for c in rg.get("checks", []):
            L.append(f"- {'✔' if c['passed'] else '✘'} {c['name']}: novo {_f(c.get('new'))} / ref {_f(c.get('ref'))}"
                     + (f" — {c['detail']}" if c.get("detail") else ""))
        L.append("")
    L += ["![matriz de confusão](confusion_matrix.png)", "", "![curvas PR](pr_curves.png)", ""]
    if has_fn:
        L += ["## Falsos negativos (amostra)", "", "![FN](false_negatives.jpg)", ""]
    if has_fp:
        L += ["## Falsos positivos (amostra, maior confiança)", "", "![FP](false_positives.jpg)", ""]
    out.write_text("\n".join(L), encoding="utf-8")
    return out
