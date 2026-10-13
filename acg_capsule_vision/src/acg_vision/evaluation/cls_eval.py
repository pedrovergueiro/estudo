"""Métricas da classificação LOUO (positivo = defect)."""

from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import load_yaml, resolve
from ..training.common import write_json
from .matching import prf

LABELS = ("normal", "defect")


def confusion(preds: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    cm = {t: {p: 0 for p in LABELS} for t in LABELS}
    for x in preds:
        cm[x["true"]][x["pred"]] += 1
    return cm


def auc(scores: list[float], labels: list[int]) -> float | None:
    s, y = np.asarray(scores), np.asarray(labels)
    pos, neg = s[y == 1], s[y == 0]
    if not len(pos) or not len(neg):
        return None
    allv = np.concatenate([neg, pos])
    ranks = allv.argsort().argsort() + 1.0
    return float((ranks[len(neg):].sum() - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg)))


def summarize(preds: list[dict[str, Any]]) -> dict[str, Any]:
    cm = confusion(preds)
    tp, fn = cm["defect"]["defect"], cm["defect"]["normal"]
    fp, tn = cm["normal"]["defect"], cm["normal"]["normal"]
    n = tp + fn + fp + tn
    rec_d = tp / (tp + fn) if tp + fn else None
    rec_n = tn / (tn + fp) if tn + fp else None
    per_unit: dict[str, dict[str, Any]] = defaultdict(lambda: {"n": 0, "correct": 0})
    for x in preds:
        u = per_unit[x["unit_id"]]
        u["true"] = x["true"]
        u["n"] += 1
        u["correct"] += int(x["pred"] == x["true"])
    units = []
    for uid, u in sorted(per_unit.items()):
        frac = u["correct"] / u["n"]
        units.append({"unit_id": uid, "true": u["true"], "frames": u["n"], "frame_accuracy": round(frac, 4),
                      "unit_majority_vote_correct": frac > 0.5})
    return {
        "n_images": n, "n_units": len(units),
        "confusion_matrix_rows_true_cols_pred": cm,
        "accuracy": (tp + tn) / n if n else None,
        "balanced_accuracy": (rec_d + rec_n) / 2 if rec_d is not None and rec_n is not None else None,
        "defect": prf(tp, fp, fn), "normal": prf(tn, fn, fp),
        "roc_auc_pooled": auc([x["p_defect"] for x in preds], [int(x["true"] == "defect") for x in preds]),
        "per_unit": units,
        "units_correct_by_majority_vote": sum(u["unit_majority_vote_correct"] for u in units),
        "note": "imagens de uma mesma unidade são quase idênticas: o tamanho efetivo da amostra é o nº de "
                "UNIDADES (10), não de imagens (355)",
    }


def examples_grid(preds: list[dict[str, Any]], out: Path, per_kind: int = 4) -> Path | None:
    res = load_yaml("resources.yaml")
    raw = resolve(res["data_dir"]) / "pill_defects"
    ok = [x for x in preds if x["pred"] == x["true"]]
    bad = [x for x in preds if x["pred"] != x["true"]]
    rows = []
    for items in (ok, bad):  # linha 1: acertos; linha 2: erros
        seen, by_cls = set(), {c: [] for c in LABELS}
        for x in sorted(items, key=lambda x: (x["unit_id"], x["image"])):
            if x["unit_id"] not in seen:  # um exemplo por unidade
                by_cls[x["true"]].append(x)
                seen.add(x["unit_id"])
        sel = []  # alterna classes para a figura mostrar as duas quando houver
        while any(by_cls.values()) and len(sel) < per_kind:
            for c in LABELS:
                if by_cls[c] and len(sel) < per_kind:
                    sel.append(by_cls[c].pop(0))
        tiles = []
        for x in sel[:per_kind]:
            img = cv2.cvtColor(cv2.resize(cv2.imread(str(raw / x["image"]), 0), (220, 220)), cv2.COLOR_GRAY2BGR)
            col = (0, 160, 0) if x["pred"] == x["true"] else (0, 0, 220)
            cv2.rectangle(img, (0, 0), (219, 34), col, -1)
            cv2.putText(img, f"real={x['true']} pred={x['pred']} p_def={x['p_defect']:.2f}", (4, 22),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1)
            tiles.append(img)
        while len(tiles) < per_kind:
            tiles.append(np.full((220, 220, 3), 255, np.uint8))
        rows.append(np.hstack(tiles))
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), np.vstack(rows))
    return out


def evaluate_louo(louo_json: dict[str, Any], out_dir: Path) -> dict[str, Any]:
    preds = louo_json["predictions"]
    rep = {"profile": louo_json["profile"], "params": louo_json["params"], **summarize(preds),
           "folds": [{k: f[k] for k in ("test_unit", "counts", "train_seconds", "test_inference_ms_per_image")}
                     for f in louo_json["folds"]],
           "total_train_seconds": round(sum(f["train_seconds"] for f in louo_json["folds"]), 1)}
    examples_grid(preds, out_dir / "examples_acertos_erros.jpg")
    rep["examples"] = "examples_acertos_erros.jpg"
    write_json(out_dir / "evaluation.json", rep)
    return rep
