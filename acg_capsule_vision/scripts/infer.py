#!/usr/bin/env python3
"""Inferência OFFLINE em imagens locais → predictions.json + imagens anotadas.

  python scripts/infer.py --weights models/final/detect_yolo11n.pt --input pasta_ou_imagens... --out reports/infer/x
  python scripts/infer.py --weights models/final/classify_yolo11n_cls.pt --input img.png --view-id view_a

A rede fica bloqueada durante a execução (ACG_OFFLINE=1, padrão); faltando pesos,
a mensagem informa o comando para obtê-los.
"""

import argparse
from pathlib import Path

import _bootstrap  # noqa: F401

from acg_vision.config import resolve
from acg_vision.inference.predictor import run


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--weights", required=True, type=Path)
    ap.add_argument("--input", required=True, nargs="+", type=Path)
    ap.add_argument("--out", type=Path, default=Path("reports/infer/latest"))
    ap.add_argument("--conf", type=float, default=0.25)
    ap.add_argument("--imgsz", type=int)
    ap.add_argument("--view-id")
    a = ap.parse_args()
    print(run(resolve(a.weights), [resolve(p) for p in a.input], resolve(a.out), a.conf, a.imgsz, a.view_id))


if __name__ == "__main__":
    main()
