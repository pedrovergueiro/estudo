"""Detecção YOLO11 — Etapa A (referência pré-treinada COCO) e Etapa B (ajuste fino).

Etapa A: os pesos COCO não têm classe "pill"; a referência mede, de forma
class-agnóstica, quanto das caixas verdadeiras é coberto por QUALQUER detecção COCO.
Isso mostra o ponto de partida antes do ajuste fino, sem fingir que existe a classe.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import cv2

from ..config import load_yaml, profile, resolve
from ..evaluation.matching import match_boxes, prf
from ..offline import enable_offline, weight_path
from .common import Timer, environment, model_summary, set_seeds, weights_info, write_json


def _gt_boxes(label: Path, w: int, h: int) -> list[tuple[float, float, float, float]]:
    out = []
    for line in label.read_text().splitlines():
        if line.strip():
            _, cx, cy, bw, bh = (float(v) for v in line.split())
            out.append(((cx - bw / 2) * w, (cy - bh / 2) * h, (cx + bw / 2) * w, (cy + bh / 2) * h))
    return out


def test_images(prepared: Path, split: str = "test") -> list[tuple[Path, Path]]:
    imgs = sorted((prepared / "images" / split).glob("*.jpg"))
    return [(p, prepared / "labels" / split / (p.stem + ".txt")) for p in imgs]


def reference_stage_a(model_key: str, out_dir: Path, imgsz: int = 640, conf: float = 0.25,
                      split: str = "test") -> dict[str, Any]:
    from ultralytics import YOLO
    enable_offline()
    cfg = load_yaml("train_detect.yaml")
    wfile = weight_path(cfg["models"][model_key])
    model = YOLO(str(wfile))
    prepared = resolve(cfg["prepared_dir"])
    tp = fp = fn = 0
    per_image, times = [], []
    classes_seen: dict[str, int] = {}
    for img_p, lbl_p in test_images(prepared, split):
        img = cv2.imread(str(img_p))
        gt = _gt_boxes(lbl_p, img.shape[1], img.shape[0])
        with Timer() as t:
            r = model.predict(img, imgsz=imgsz, conf=conf, verbose=False, device="cpu")[0]
        times.append(t.seconds * 1000)
        pred = [tuple(b) for b in r.boxes.xyxy.tolist()]
        for c in r.boxes.cls.tolist():
            n = model.names[int(c)]
            classes_seen[n] = classes_seen.get(n, 0) + 1
        m = match_boxes(pred, gt, 0.5)
        tp, fp, fn = tp + m["tp"], fp + m["fp"], fn + m["fn"]
        per_image.append({"image": img_p.name, "gt": len(gt), "pred": len(pred), **m})
    rep = {
        "stage": "A_pretrained_reference", "model_key": model_key, "weights": weights_info(wfile),
        "model": model_summary(model), "split": split, "imgsz": imgsz, "conf": conf,
        "note": "COCO não tem classe 'pill': casamento CLASS-AGNÓSTICO (qualquer classe COCO, IoU>=0.5)",
        "class_agnostic": {"tp": tp, "fp": fp, "fn": fn, **prf(tp, fp, fn)},
        "coco_classes_predicted": dict(sorted(classes_seen.items(), key=lambda kv: -kv[1])),
        "inference_ms_per_image": {"mean": sum(times) / len(times), "max": max(times)},
        "per_image": per_image, "environment": environment(),
    }
    write_json(out_dir / f"stage_a_{model_key}.json", rep)
    return rep


def finetune_stage_b(model_key: str, profile_name: str = "cpu_conservative", name: str | None = None,
                     overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    from ultralytics import YOLO
    enable_offline()
    cfg = load_yaml("train_detect.yaml")
    prof = profile(cfg, profile_name)
    prof.update(overrides or {})
    set_seeds(cfg["seed"])
    wfile = weight_path(cfg["models"][model_key])
    data_yaml = resolve(cfg["prepared_dir"]) / "data.yaml"
    if not data_yaml.exists():
        raise FileNotFoundError(f"{data_yaml} ausente: rode python scripts/prepare_datasets.py")
    model = YOLO(str(wfile))
    run_name = name or f"{model_key}_{profile_name}"
    with Timer() as t:
        model.train(data=str(data_yaml), project=str(resolve(cfg["output_dir"])), name=run_name, exist_ok=False,
                    seed=cfg["seed"], deterministic=cfg["deterministic"], plots=True, verbose=False, amp=False,
                    **prof)
    save_dir = Path(model.trainer.save_dir)
    best, last = save_dir / "weights" / "best.pt", save_dir / "weights" / "last.pt"
    manifest = {
        "stage": "B_finetune", "model_key": model_key, "profile": profile_name, "params": prof,
        "seed": cfg["seed"], "initial_weights": weights_info(wfile), "data_yaml": str(data_yaml),
        "run_dir": str(save_dir), "train_seconds": round(t.seconds, 1),
        "best": weights_info(best), "last": weights_info(last),
        "selection": "best.pt = maior fitness na validação (0.1·mAP50 + 0.9·mAP50-95)",
        "resume_command": f"python scripts/train_detect.py --resume {last}",
        "environment": environment(),
    }
    write_json(save_dir / "run_manifest.json", manifest)
    return manifest


def resume(last_pt: Path) -> dict[str, Any]:
    """Retoma um treino interrompido (Ultralytics: resume=True usa os args salvos no last.pt)."""
    from ultralytics import YOLO
    enable_offline()
    model = YOLO(str(last_pt))
    with Timer() as t:
        model.train(resume=True)
    return {"resumed_from": str(last_pt), "seconds": round(t.seconds, 1), "run_dir": str(model.trainer.save_dir)}
