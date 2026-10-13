#!/usr/bin/env python3
"""Prepara os datasets baixados (offline): divisão temporal (Medical Pills) e
agrupamento por unidade física (Pill-Defects).

  python scripts/prepare_datasets.py
"""

import json

import _bootstrap  # noqa: F401

from acg_vision.config import load_yaml, resolve
from acg_vision.data import medical_pills, pill_defects
from acg_vision.offline import require


def main() -> None:
    res = load_yaml("resources.yaml")
    raw = resolve(res["data_dir"])
    det = load_yaml("train_detect.yaml")
    src = require(raw / "medical_pills", "dataset Medical Pills", "python scripts/fetch_resources.py --only medical_pills")
    sp = det["split"]
    m = medical_pills.prepare(src, resolve(det["prepared_dir"]), sp["test_fraction"], sp["val_fraction"],
                              sp["gap_frames"])
    print("Medical Pills:", json.dumps({k: {kk: v[kk] for kk in ("images", "boxes", "from_official_val")}
                                        for k, v in m["splits"].items() if k != "dropped_frames"}))
    cls = load_yaml("train_classify.yaml")
    src = require(raw / "pill_defects", "dataset Pill-Defects", "python scripts/fetch_resources.py --only pill_defects")
    units = pill_defects.group_units(src, cls["grouping"]["max_mae_same_unit"])
    s = pill_defects.write_manifest(units, src, resolve(cls["prepared_dir"]))
    print("Pill-Defects:", s["n_images"], "imagens,", s["n_units"], "unidades físicas", s["units_per_class"])


if __name__ == "__main__":
    main()
