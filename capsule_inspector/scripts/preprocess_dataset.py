#!/usr/bin/env python3
"""Aplica a cadeia `preprocessing` de um perfil a um dataset YOLO (cópia), para que
treino e inspeção vejam imagens com o MESMO pré-processamento.

  python scripts/preprocess_dataset.py --src data/processed/capsules_v0 \
      --dst data/processed/capsules_v0_transparent --profile transparent_clear
Rótulos e metadata.csv são copiados sem alteração (as operações não mudam a geometria).
"""

import argparse
import json
import shutil
from pathlib import Path

import cv2
import numpy as np

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.yolo_io import label_path_for, list_images
from capsule_inspector.inference.preprocess import build_pipeline


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--src", type=Path, required=True)
    ap.add_argument("--dst", type=Path, required=True)
    ap.add_argument("--profile", required=True)
    a = ap.parse_args()
    s = load_settings()
    prof = s.lighting.profiles[a.profile]
    fn = build_pipeline(prof.preprocessing)
    src, dst = s.path(a.src), s.path(a.dst)
    n = 0
    for img_p in list_images(src):
        rel = img_p.relative_to(src)
        img = cv2.imdecode(np.fromfile(str(img_p), dtype=np.uint8), cv2.IMREAD_COLOR)
        out = fn(img)
        (dst / rel).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(dst / rel), out)
        lp = label_path_for(img_p)
        if lp.exists():
            lrel = lp.relative_to(src)
            (dst / lrel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(lp, dst / lrel)
        n += 1
    if (src / "metadata.csv").exists():
        shutil.copy2(src / "metadata.csv", dst / "metadata.csv")
    (dst / "preprocessing.json").write_text(json.dumps(
        {"profile": a.profile, "profile_hash": s.profile_hash(a.profile), "steps": prof.preprocessing},
        indent=2), encoding="utf-8")
    print(f"{n} imagens processadas com {fn.steps} -> {dst}")


if __name__ == "__main__":
    main()
