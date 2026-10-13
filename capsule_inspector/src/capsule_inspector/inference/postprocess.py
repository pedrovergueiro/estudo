"""Decodificação da saída YOLO11 (ONNX), NMS e validação de coordenadas.

Formato da saída exportada pela Ultralytics para YOLO11:
- detecção:    output0 (1, 4 + nc, N)          — cx, cy, w, h em pixels da entrada
- segmentação: output0 (1, 4 + nc + 32, N) e output1 (1, 32, H/4, W/4) (protótipos)
"""

from __future__ import annotations

import cv2
import numpy as np

from ..types import Detection


class CoordinateError(ValueError):
    pass


def nms(boxes: np.ndarray, scores: np.ndarray, iou_thr: float) -> np.ndarray:
    """NMS clássico em numpy. boxes: (N,4) xyxy. Retorna índices mantidos."""
    if boxes.size == 0:
        return np.zeros((0,), dtype=np.int64)
    x1, y1, x2, y2 = boxes.T
    areas = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)
    order = scores.argsort()[::-1]
    keep = []
    while order.size:
        i = order[0]
        keep.append(i)
        if order.size == 1:
            break
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        inter = np.maximum(0, xx2 - xx1) * np.maximum(0, yy2 - yy1)
        iou = inter / np.maximum(areas[i] + areas[order[1:]] - inter, 1e-9)
        order = order[1:][iou <= iou_thr]
    return np.array(keep, dtype=np.int64)


def box_iou(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """IoU par-a-par entre (N,4) e (M,4) xyxy."""
    if a.size == 0 or b.size == 0:
        return np.zeros((len(a), len(b)), np.float64)
    tl = np.maximum(a[:, None, :2], b[None, :, :2])
    br = np.minimum(a[:, None, 2:], b[None, :, 2:])
    inter = np.prod(np.clip(br - tl, 0, None), axis=2)
    aa = np.prod(np.clip(a[:, 2:] - a[:, :2], 0, None), axis=1)
    ab = np.prod(np.clip(b[:, 2:] - b[:, :2], 0, None), axis=1)
    return inter / np.maximum(aa[:, None] + ab[None, :] - inter, 1e-9)


def validate_box(box: tuple[float, float, float, float], width: int, height: int,
                 tol: float = 1.0) -> tuple[float, float, float, float]:
    """Garante caixa finita, ordenada e dentro da imagem (com tolerância de 1 px)."""
    x1, y1, x2, y2 = (float(v) for v in box)
    if not all(np.isfinite([x1, y1, x2, y2])):
        raise CoordinateError(f"coordenada não finita: {box}")
    if x2 < x1 or y2 < y1:
        raise CoordinateError(f"caixa invertida: {box}")
    if x1 < -tol or y1 < -tol or x2 > width + tol or y2 > height + tol:
        raise CoordinateError(f"caixa fora da imagem {width}x{height}: {box}")
    return (min(max(x1, 0.0), width), min(max(y1, 0.0), height),
            min(max(x2, 0.0), width), min(max(y2, 0.0), height))


def decode_yolo_output(output0: np.ndarray, num_classes: int, conf_thr: float, iou_thr: float,
                       max_det: int, ratio: float, pad: tuple[float, float],
                       orig_shape: tuple[int, int], names: list[str],
                       protos: np.ndarray | None = None, input_size: int = 640) -> list[Detection]:
    pred = output0[0] if output0.ndim == 3 else output0
    expected = 4 + num_classes + (protos.shape[1] if protos is not None else 0)
    if pred.shape[0] == expected:      # layout Ultralytics: (C, N)
        pred = pred.T
    if pred.shape[1] != expected:
        raise ValueError(f"saída do modelo com {pred.shape[1]} canais; esperado {expected} "
                         f"({num_classes} classes{' + 32 máscaras' if protos is not None else ''})")
    cls_scores = pred[:, 4:4 + num_classes]
    cls_ids = cls_scores.argmax(1)
    scores = cls_scores[np.arange(len(pred)), cls_ids]
    m = scores > conf_thr
    if not np.any(m):
        return []
    pred, cls_ids, scores = pred[m], cls_ids[m], scores[m]
    cx, cy, w, h = pred[:, 0], pred[:, 1], pred[:, 2], pred[:, 3]
    boxes = np.stack([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], 1)
    # NMS por classe (deslocamento por classe, como a Ultralytics)
    offset = cls_ids[:, None].astype(np.float32) * 7680.0
    keep = nms(boxes + offset, scores, iou_thr)[:max_det]
    boxes, scores, cls_ids = boxes[keep], scores[keep], cls_ids[keep]
    coeffs = pred[keep, 4 + num_classes:] if protos is not None else None

    H, W = orig_shape
    px, py = pad
    boxes_orig = boxes.copy()
    boxes_orig[:, [0, 2]] = (boxes_orig[:, [0, 2]] - px) / ratio
    boxes_orig[:, [1, 3]] = (boxes_orig[:, [1, 3]] - py) / ratio
    boxes_orig[:, [0, 2]] = boxes_orig[:, [0, 2]].clip(0, W)
    boxes_orig[:, [1, 3]] = boxes_orig[:, [1, 3]].clip(0, H)

    polygons: list[list[tuple[float, float]] | None] = [None] * len(boxes)
    if protos is not None and coeffs is not None and len(boxes):
        polygons = _decode_masks(protos[0], coeffs, boxes, ratio, pad, orig_shape, input_size)

    dets = []
    for b, s, c, poly in zip(boxes_orig, scores, cls_ids, polygons):
        if b[2] - b[0] <= 0 or b[3] - b[1] <= 0:
            continue
        name = names[int(c)] if int(c) < len(names) else str(int(c))
        dets.append(Detection(int(c), name, float(s), tuple(float(v) for v in b), poly))
    return dets


def _decode_masks(protos: np.ndarray, coeffs: np.ndarray, boxes_in: np.ndarray, ratio: float,
                  pad: tuple[float, float], orig_shape: tuple[int, int], input_size: int
                  ) -> list[list[tuple[float, float]] | None]:
    c, mh, mw = protos.shape
    masks = 1.0 / (1.0 + np.exp(-(coeffs @ protos.reshape(c, -1))))
    masks = masks.reshape(-1, mh, mw)
    sx, sy = mw / input_size, mh / input_size
    H, W = orig_shape
    px, py = pad
    out: list[list[tuple[float, float]] | None] = []
    for m, b in zip(masks, boxes_in):
        x1, y1, x2, y2 = b
        crop = np.zeros_like(m)
        ix1, iy1 = int(max(0, np.floor(x1 * sx))), int(max(0, np.floor(y1 * sy)))
        ix2, iy2 = int(min(mw, np.ceil(x2 * sx))), int(min(mh, np.ceil(y2 * sy)))
        crop[iy1:iy2, ix1:ix2] = m[iy1:iy2, ix1:ix2]
        up = cv2.resize(crop, (input_size, input_size), interpolation=cv2.INTER_LINEAR)
        top, left = int(round(py)), int(round(px))
        hh, ww = int(round(H * ratio)), int(round(W * ratio))
        up = up[top:top + hh, left:left + ww]
        up = cv2.resize(up, (W, H), interpolation=cv2.INTER_LINEAR)
        binm = (up > 0.5).astype(np.uint8)
        cnts, _ = cv2.findContours(binm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not cnts:
            out.append(None)
            continue
        cnt = max(cnts, key=cv2.contourArea)
        out.append([(float(p[0][0]), float(p[0][1])) for p in cnt])
    return out
