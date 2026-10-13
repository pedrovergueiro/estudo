#!/usr/bin/env python3
"""Treina YOLO11 com a configuração de configs/train.yaml (estação de treinamento).

  python scripts/train_model.py                         # experimento baseline
  python scripts/train_model.py --experiment yolo11s
  python scripts/train_model.py --set epochs=5 --set imgsz=320   # ajustes rápidos
"""

import argparse
import json
from pathlib import Path

import yaml

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.training.train import train


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--experiment")
    ap.add_argument("--data", type=Path, help="data.yaml (padrão: data/splits/data.yaml)")
    ap.add_argument("--set", action="append", default=[], metavar="CHAVE=VALOR",
                    help="sobrescreve hiperparâmetro (valor interpretado como YAML)")
    a = ap.parse_args()
    s = load_settings()
    over = {}
    for kv in a.set:
        k, v = kv.split("=", 1)
        over[k] = yaml.safe_load(v)
    m = train(s, a.experiment, a.data, over)
    print(json.dumps({k: m[k] for k in ("experiment", "run_dir", "best_checkpoint", "val_metrics_best")},
                     indent=2, default=str))
    print("\nPróximo passo: avalie no split de TESTE com scripts/evaluate_model.py --model",
          m["best_checkpoint"]["path"])


if __name__ == "__main__":
    main()
