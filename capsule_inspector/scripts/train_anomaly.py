#!/usr/bin/env python3
"""Treina o Modo C (PatchCore-lite) com cápsulas NORMAIS do split de treino e
calibra o limiar com cápsulas normais do split de validação.

  python scripts/train_anomaly.py --out models/anomaly/patchcore_lite.npz
  python scripts/train_anomaly.py --extractor-onnx models/anomaly/resnet18_l2l3.onnx

Uma cápsula é "normal" se o seu arquivo de rótulo contém apenas a classe `capsule`.
Metade das normais de validação calibra o limiar e a outra metade mede o falso alarme.
Antes de habilitar o Modo C, compare no TESTE: evaluate_model.py --anomaly <modelo.npz>.
"""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.yolo_io import label_path_for, read_label_file
from capsule_inspector.inference.anomaly import HandcraftedExtractor, OnnxExtractor, PatchCoreLite, normalize_crop


def crops(paths: list[Path], capsule_id: int, want_normal: bool) -> list[np.ndarray]:
    out = []
    for p in paths:
        lp = label_path_for(p)
        anns = read_label_file(lp) if lp.exists() else []
        caps = [x for x in anns if x.class_id == capsule_id]
        defective = any(x.class_id != capsule_id for x in anns)
        if not caps or defective == want_normal:
            continue
        img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        h, w = img.shape[:2]
        for c in caps:
            out.append(normalize_crop(img, c.xyxy(w, h)))
    return out


def auroc(neg: np.ndarray, pos: np.ndarray) -> float:
    if not len(neg) or not len(pos):
        return float("nan")
    allv = np.concatenate([neg, pos])
    ranks = allv.argsort().argsort() + 1
    rp = ranks[len(neg):].sum()
    return float((rp - len(pos) * (len(pos) + 1) / 2) / (len(pos) * len(neg)))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path, default=Path("models/anomaly/patchcore_lite.npz"))
    ap.add_argument("--extractor-onnx", type=Path)
    ap.add_argument("--max-bank", type=int, default=4000)
    ap.add_argument("--quantile", type=float, default=0.995)
    a = ap.parse_args()
    s = load_settings()
    names = s.taxonomy.training_names()
    cid = names.index(s.decision.capsule_class)
    sp = s.path(s.dataset.paths["splits"])
    train = [Path(p) for p in (sp / "train.txt").read_text().split()]
    val = [Path(p) for p in (sp / "val.txt").read_text().split()]
    ext = OnnxExtractor(s.path(a.extractor_onnx)) if a.extractor_onnx else HandcraftedExtractor()
    normal_train = crops(train, cid, True)
    model = PatchCoreLite.fit(normal_train, ext, a.max_bank)
    normal_val = crops(val, cid, True)
    # metade das normais de validação calibra o limiar; a outra metade mede falso alarme
    order = np.random.default_rng(0).permutation(len(normal_val))
    half = len(order) // 2
    calib = [normal_val[i] for i in order[:half]]
    held = [normal_val[i] for i in order[half:]]
    thr = model.calibrate(calib, a.quantile)
    defect_val = crops(val, cid, False)
    sn = np.array([model.score(c).score for c in held])
    sd = np.array([model.score(c).score for c in defect_val])
    model.save(s.path(a.out))
    rep = {"n_train_normal": len(normal_train), "n_val_normal_calibration": len(calib),
           "n_val_normal_heldout": len(held), "n_val_defective": len(defect_val),
           "threshold": thr, "val_false_alarm_rate": float((sn > thr).mean()) if len(sn) else None,
           "val_defect_recall": float((sd > thr).mean()) if len(sd) else None,
           "val_auroc": auroc(sn, sd), "meta": model.meta}
    s.path(a.out).with_suffix(".report.json").write_text(json.dumps(rep, indent=2), encoding="utf-8")
    print(json.dumps(rep, indent=2))


if __name__ == "__main__":
    main()
