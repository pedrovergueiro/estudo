#!/usr/bin/env python3
"""Valida o dataset YOLO, gera relatório e (opcional) faz a divisão por grupo físico.

Exemplos:
  python scripts/validate_dataset.py                      # dataset de configs/dataset.yaml
  python scripts/validate_dataset.py --split              # valida, divide e revalida com os splits
  python scripts/validate_dataset.py --root data/interim/x_yolo --report-dir data/reports/x
Código de saída 1 se houver erros ou vazamento entre splits.
"""

import argparse
import json
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.metadata import load_metadata
from capsule_inspector.dataset.report import write_validation_report
from capsule_inspector.dataset.split import group_aware_split, read_split_lists, write_split
from capsule_inspector.dataset.validate import validate_dataset


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", type=Path)
    ap.add_argument("--metadata", type=Path)
    ap.add_argument("--task", choices=["detect", "segment"])
    ap.add_argument("--split", action="store_true", help="gera data/splits/{train,val,test}.txt + data.yaml")
    ap.add_argument("--split-dir", type=Path)
    ap.add_argument("--report-dir", type=Path)
    a = ap.parse_args()
    s = load_settings()
    wd = s.dataset.working_dataset
    root = a.root or s.path(wd.root)
    meta_path = a.metadata or (s.path(wd.metadata_csv) if wd.metadata_csv else None)
    if a.root and not a.metadata:
        meta_path = root / "metadata.csv"
    metadata = load_metadata(meta_path, root)
    names = s.taxonomy.training_names()
    split_dir = a.split_dir or s.path(s.dataset.paths["splits"])
    report_dir = a.report_dir or s.path(s.dataset.paths["reports"])
    split_info = None
    split_of = None
    if a.split:
        res = group_aware_split(root, names, s.dataset.split, metadata)
        write_split(res, root, split_dir, names, s.dataset.split.seed)
        split_info = res.as_dict()
        split_of = res.assignment
        for w in res.warnings:
            print("AVISO split:", w)
    elif (split_dir / "train.txt").exists():
        split_of = read_split_lists(split_dir, root) or None
    rep = validate_dataset(root, names, s.dataset.validation, a.task or wd.task, metadata, split_of,
                           tuple(s.dataset.split.group_by))
    paths = write_validation_report(rep, report_dir, split_info)
    d = rep.as_dict()
    print(json.dumps({k: d[k] for k in ("ok", "n_images", "n_labels", "n_errors", "n_warnings",
                                         "issue_counts", "class_instances", "imbalance_ratio")},
                     indent=2, ensure_ascii=False))
    if rep.leakage:
        print(f"VAZAMENTO entre splits: {len(rep.leakage)} ocorrências (ver relatório)")
    print("relatório:", paths["markdown"])
    return 0 if rep.ok else 1


if __name__ == "__main__":
    sys.exit(main())
