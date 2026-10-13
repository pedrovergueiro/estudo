"""Avaliação do detector no split de TESTE (blocos temporais finais do vídeo)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import load_yaml, resolve
from ..offline import enable_offline
from ..training.common import Timer, environment, weights_info, write_json
from ..training.detect import _gt_boxes, test_images
from .matching import match_boxes, prf


def _draw(img: np.ndarray, gt, pred, m) -> np.ndarray:  # type: ignore[no-untyped-def]
    vis = img.copy()
    for j, b in enumerate(gt):
        col = (0, 0, 255) if j in m["fn_idx"] else (0, 200, 0)
        cv2.rectangle(vis, tuple(int(v) for v in b[:2]), tuple(int(v) for v in b[2:]), col, 3)
    for i, b in enumerate(pred):
        col = (255, 128, 0) if i in m["tp_idx"] else (0, 165, 255)
        cv2.rectangle(vis, tuple(int(v) + 4 for v in b[:2]), tuple(int(v) - 4 for v in b[2:]), col, 2)
    cv2.putText(vis, f"TP {m['tp']}  FP {m['fp']}  FN {m['fn']}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                (0, 0, 0), 6)
    cv2.putText(vis, f"TP {m['tp']}  FP {m['fp']}  FN {m['fn']}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5,
                (255, 255, 255), 2)
    return vis


def evaluate_detector(weights: Path, out_dir: Path, split: str = "test", imgsz: int = 640,
                      conf: float = 0.25, iou_match: float = 0.5) -> dict[str, Any]:
    from ultralytics import YOLO
    enable_offline()
    cfg = load_yaml("train_detect.yaml")
    prepared = resolve(cfg["prepared_dir"])
    model = YOLO(str(weights))
    # 1) métricas padrão (mAP com varredura de confiança) no split pedido
    with Timer() as tv:
        mv = model.val(data=str(prepared / "data.yaml"), split=split, imgsz=imgsz, batch=4, conf=0.001, iou=0.7,
                       device="cpu", plots=True, project=str(out_dir), name="ultralytics_val", exist_ok=True,
                       verbose=False)
    P, R = float(mv.box.mp), float(mv.box.mr)
    standard = {"precision": P, "recall": R, "f1": 2 * P * R / (P + R) if P + R else None,
                "map50": float(mv.box.map50), "map50_95": float(mv.box.map), "val_seconds": round(tv.seconds, 1),
                "note": "P/R da Ultralytics no ponto de F1 máximo da curva; mAP com conf>=0.001"}
    # 2) ponto de operação fixo (conf) com casamento próprio + exemplos
    tp = fp = fn = 0
    per_image, times = [], []
    (out_dir / "examples").mkdir(parents=True, exist_ok=True)
    rendered = []
    for img_p, lbl_p in test_images(prepared, split):
        img = cv2.imread(str(img_p))
        gt = _gt_boxes(lbl_p, img.shape[1], img.shape[0])
        with Timer() as t:
            r = model.predict(img, imgsz=imgsz, conf=conf, verbose=False, device="cpu")[0]
        times.append(t.seconds * 1000)
        pred = [tuple(b) for b in r.boxes.xyxy.tolist()]
        m = match_boxes(pred, gt, iou_match, r.boxes.conf.tolist())
        tp, fp, fn = tp + m["tp"], fp + m["fp"], fn + m["fn"]
        per_image.append({"image": img_p.name, "gt": len(gt), "pred": len(pred),
                          **{k: m[k] for k in ("tp", "fp", "fn")}})
        rendered.append((m["fp"] + m["fn"], img_p, img, gt, pred, m))
    rendered.sort(key=lambda x: x[0])
    picks = {"best": rendered[:2], "worst": rendered[-2:]}
    examples = []
    for tag, items in picks.items():
        for _, img_p, img, gt, pred, m in items:
            p = out_dir / "examples" / f"{tag}_{img_p.stem}.jpg"
            cv2.imwrite(str(p), cv2.resize(_draw(img, gt, pred, m), (960, 540)))
            examples.append(str(p.relative_to(out_dir)))
    rep = {"weights": weights_info(weights), "split": split, "n_images": len(per_image),
           "n_gt_boxes": sum(x["gt"] for x in per_image), "imgsz": imgsz, "standard": standard,
           "operating_point": {"conf": conf, "iou": iou_match, "tp": tp, "fp": fp, "fn": fn, **prf(tp, fp, fn)},
           "inference_ms_per_image": {"mean": float(np.mean(times)), "p95": float(np.percentile(times, 95)),
                                      "note": "predict() de imagem 1920x1080, CPU, inclui pré/pós-processamento"},
           "per_image": per_image, "examples": examples,
           "legend": "verde=GT encontrada, vermelho=GT perdida (FN), azul=predição correta, laranja=FP",
           "environment": environment()}
    write_json(out_dir / "evaluation.json", rep)
    return rep
