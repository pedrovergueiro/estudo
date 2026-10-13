#!/usr/bin/env python3
"""Detecção YOLO11 no Medical Pills (offline).

  python scripts/train_detect.py --stage A --model yolo11n          # referência pré-treinada (COCO)
  python scripts/train_detect.py --stage B --model yolo11n          # ajuste fino, perfil cpu_conservative
  python scripts/train_detect.py --stage B --model yolo11s --profile cpu_conservative
  python scripts/train_detect.py --stage B --model yolo11n --profile cpu_smoke   # teste rápido
  python scripts/train_detect.py --resume runs/detect/<run>/weights/last.pt      # retomar interrompido
  python scripts/train_detect.py --stage B --model yolo11n --set epochs=60 --set batch=4
"""

import argparse
import json

import _bootstrap  # noqa: F401
import yaml

from acg_vision.config import resolve
from acg_vision.training.detect import finetune_stage_b, reference_stage_a, resume


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stage", choices=["A", "B"])
    ap.add_argument("--model", default="yolo11n")
    ap.add_argument("--profile", default="cpu_conservative")
    ap.add_argument("--name")
    ap.add_argument("--set", action="append", default=[], metavar="CHAVE=VALOR")
    ap.add_argument("--resume")
    a = ap.parse_args()
    if a.resume:
        print(json.dumps(resume(resolve(a.resume)), indent=2))
        return
    if a.stage == "A":
        r = reference_stage_a(a.model, resolve("reports/detect"))
        print(json.dumps({k: r[k] for k in ("model_key", "class_agnostic", "coco_classes_predicted")}, indent=2))
    else:
        over = {k: yaml.safe_load(v) for k, v in (s.split("=", 1) for s in a.set)}
        m = finetune_stage_b(a.model, a.profile, a.name, over)
        print(json.dumps({k: m[k] for k in ("run_dir", "train_seconds", "best")}, indent=2))


if __name__ == "__main__":
    main()
