#!/usr/bin/env python3
"""Avaliação nos conjuntos de TESTE (offline).

  python scripts/evaluate.py detect --weights runs/detect/yolo11n_cpu_conservative/weights/best.pt --name yolo11n
  python scripts/evaluate.py classify --louo runs/classify/louo_cpu_conservative/louo_results.json
"""

import argparse
import json
from pathlib import Path

import _bootstrap  # noqa: F401

from acg_vision.config import resolve
from acg_vision.evaluation.cls_eval import evaluate_louo
from acg_vision.evaluation.detect_eval import evaluate_detector


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="task", required=True)
    d = sub.add_parser("detect")
    d.add_argument("--weights", required=True, type=Path)
    d.add_argument("--name", required=True)
    d.add_argument("--split", default="test")
    d.add_argument("--imgsz", type=int, default=640)
    c = sub.add_parser("classify")
    c.add_argument("--louo", required=True, type=Path)
    a = ap.parse_args()
    if a.task == "detect":
        r = evaluate_detector(resolve(a.weights), resolve("reports/detect") / f"{a.name}_{a.split}", a.split, a.imgsz)
        print(json.dumps({"standard": r["standard"], "operating_point": r["operating_point"]}, indent=2))
    else:
        r = evaluate_louo(json.loads(resolve(a.louo).read_text()), resolve("reports/classify"))
        print(json.dumps({k: r[k] for k in ("accuracy", "balanced_accuracy", "defect", "normal", "roc_auc_pooled",
                                             "units_correct_by_majority_vote")}, indent=2))


if __name__ == "__main__":
    main()
