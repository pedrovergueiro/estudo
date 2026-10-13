"""Casamento de caixas e precisão/recall/F1."""

from __future__ import annotations

from typing import Any

import numpy as np

Box = tuple[float, float, float, float]


def iou_matrix(a: list[Box], b: list[Box]) -> np.ndarray:
    if not a or not b:
        return np.zeros((len(a), len(b)))
    A, B = np.array(a, float), np.array(b, float)
    tl = np.maximum(A[:, None, :2], B[None, :, :2])
    br = np.minimum(A[:, None, 2:], B[None, :, 2:])
    inter = np.prod(np.clip(br - tl, 0, None), axis=2)
    aa = np.prod(A[:, 2:] - A[:, :2], axis=1)
    ab = np.prod(B[:, 2:] - B[:, :2], axis=1)
    return inter / np.maximum(aa[:, None] + ab[None] - inter, 1e-9)


def match_boxes(pred: list[Box], gt: list[Box], iou_thr: float = 0.5,
                scores: list[float] | None = None) -> dict[str, Any]:
    """Casamento guloso por confiança (ou ordem dada). Retorna contagens e índices."""
    order = list(np.argsort(-np.array(scores))) if scores is not None and len(scores) else list(range(len(pred)))
    ious = iou_matrix(pred, gt)
    used = np.zeros(len(gt), bool)
    tp_idx, fp_idx = [], []
    for i in order:
        if len(gt):
            cand = np.where(~used, ious[i], -1)
            j = int(cand.argmax())
            if cand[j] >= iou_thr:
                used[j] = True
                tp_idx.append(int(i))
                continue
        fp_idx.append(int(i))
    return {"tp": len(tp_idx), "fp": len(fp_idx), "fn": int((~used).sum()), "tp_idx": tp_idx, "fp_idx": fp_idx,
            "fn_idx": [int(j) for j in np.where(~used)[0]]}


def prf(tp: int, fp: int, fn: int) -> dict[str, float | None]:
    p = tp / (tp + fp) if tp + fp else None
    r = tp / (tp + fn) if tp + fn else None
    f1 = 2 * p * r / (p + r) if p is not None and r is not None and (p + r) > 0 else None
    return {"precision": p, "recall": r, "f1": f1}
