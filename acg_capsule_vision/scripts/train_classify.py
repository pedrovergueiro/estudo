#!/usr/bin/env python3
"""Classificação normal × defeito (YOLO11-cls) no Pill-Defects (offline).

  python scripts/train_classify.py --stage A                 # referência ImageNet + linha de base
  python scripts/train_classify.py --stage B                 # 10 dobras LOUO (uma unidade física por vez)
  python scripts/train_classify.py --stage B --profile cpu_smoke --units defect-s6-f2931-2946
  python scripts/train_classify.py --stage final             # modelo com todas as unidades (demonstração)
"""

import argparse
import json

import _bootstrap  # noqa: F401

from acg_vision.config import resolve
from acg_vision.training.classify import louo_stage_b, reference_stage_a, train_final


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stage", choices=["A", "B", "final"], required=True)
    ap.add_argument("--profile", default="cpu_conservative")
    ap.add_argument("--units", nargs="*")
    a = ap.parse_args()
    if a.stage == "A":
        r = reference_stage_a(resolve("reports/classify"))
        print(json.dumps({k: r[k] for k in ("imagenet_top1_by_true_label", "majority_baseline")}, indent=2))
    elif a.stage == "B":
        r = louo_stage_b(a.profile, a.units)
        print(json.dumps([{k: f[k] for k in ("test_unit", "train_seconds")} for f in r["folds"]], indent=2))
    else:
        print(json.dumps(train_final(a.profile), indent=2, default=str)[:800])


if __name__ == "__main__":
    main()
