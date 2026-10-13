"""Medical Pills (Ultralytics, AGPL-3.0): detecção de "pill" em quadros de UM vídeo.

A divisão oficial (train/val) intercala quadros vizinhos (passo de 4 quadros), o que
vaza informação. Aqui a divisão é refeita por BLOCOS TEMPORAIS contíguos, com quadros
descartados nas fronteiras. Limitação residual: todas as imagens mostram os mesmos
blisters físicos sob a mesma iluminação — o teste mede generalização para novos
pontos de vista do mesmo cenário, não para outros produtos ou máquinas.
"""

from __future__ import annotations

import json
import math
import re
import shutil
from pathlib import Path
from typing import Any

import numpy as np
import yaml

FRAME_RE = re.compile(r"Frame_(\d+)\.(jpg|jpeg|png)$", re.I)


class LabelError(ValueError):
    pass


def read_labels(path: Path) -> np.ndarray:
    rows = []
    for k, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip():
            continue
        v = line.split()
        if len(v) != 5:
            raise LabelError(f"{path}:{k}: esperado 5 campos (detecção YOLO)")
        c, *box = (float(x) for x in v)
        if c != 0 or any(not 0.0 <= b <= 1.0 for b in box) or box[2] <= 0 or box[3] <= 0:
            raise LabelError(f"{path}:{k}: classe/caixa inválida {v}")
        rows.append([c, *box])
    return np.array(rows, np.float64).reshape(-1, 5)


def collect_frames(raw: Path) -> list[dict[str, Any]]:
    frames = []
    for img in sorted((raw / "images").rglob("*")):
        m = FRAME_RE.search(img.name)
        if not m:
            continue
        lbl = raw / "labels" / img.parent.name / (img.stem + ".txt")
        if not lbl.exists():
            raise LabelError(f"rótulo ausente para {img}")
        frames.append({"frame": int(m.group(1)), "image": img, "label": lbl,
                       "official_split": img.parent.name, "boxes": read_labels(lbl)})
    frames.sort(key=lambda f: f["frame"])
    idx = [f["frame"] for f in frames]
    if len(set(idx)) != len(idx):
        raise LabelError("índices de quadro duplicados")
    return frames


def temporal_split(n: int, test_fraction: float, val_fraction: float, gap: int) -> dict[str, list[int]]:
    """Índices (posições na lista ordenada) de treino/val/teste/descartados."""
    n_test = max(1, math.ceil(n * test_fraction))
    n_val = max(1, math.ceil(n * val_fraction))
    test = list(range(n - n_test, n))
    val_end = n - n_test - gap
    val = list(range(val_end - n_val, val_end))
    train_end = val[0] - gap
    if train_end <= 0:
        raise ValueError("dados insuficientes para a divisão pedida")
    train = list(range(0, train_end))
    dropped = sorted(set(range(n)) - set(train) - set(val) - set(test))
    return {"train": train, "val": val, "test": test, "dropped": dropped}


def prepare(raw: Path, out: Path, test_fraction: float = 0.2, val_fraction: float = 0.15,
            gap: int = 2) -> dict[str, Any]:
    frames = collect_frames(raw)
    sp = temporal_split(len(frames), test_fraction, val_fraction, gap)
    if out.exists():
        shutil.rmtree(out)
    stats: dict[str, Any] = {}
    for name in ("train", "val", "test"):
        (out / "images" / name).mkdir(parents=True)
        (out / "labels" / name).mkdir(parents=True)
        boxes = []
        for i in sp[name]:
            f = frames[i]
            shutil.copy2(f["image"], out / "images" / name / f["image"].name)
            shutil.copy2(f["label"], out / "labels" / name / f["label"].name)
            boxes.append(f["boxes"])
        allb = np.concatenate(boxes) if boxes else np.zeros((0, 5))
        stats[name] = {"images": len(sp[name]), "boxes": int(len(allb)),
                       "frames": [frames[i]["frame"] for i in sp[name]],
                       "box_w_px_median": float(np.median(allb[:, 3]) * 1920) if len(allb) else None,
                       "box_h_px_median": float(np.median(allb[:, 4]) * 1080) if len(allb) else None,
                       "from_official_val": sum(frames[i]["official_split"] == "val" for i in sp[name])}
    stats["dropped_frames"] = [frames[i]["frame"] for i in sp["dropped"]]
    data_yaml = {"path": str(out.resolve()), "train": "images/train", "val": "images/val", "test": "images/test",
                 "names": {0: "pill"}}
    (out / "data.yaml").write_text(yaml.safe_dump(data_yaml, sort_keys=False), encoding="utf-8")
    manifest = {"dataset": "medical_pills", "n_frames": len(frames), "split_method": "temporal_blocks",
                "test_fraction": test_fraction, "val_fraction": val_fraction, "gap_frames": gap,
                "classes": ["pill"], "splits": stats,
                "residual_leakage_note": "mesma cena/objetos físicos em todos os quadros (um único vídeo)"}
    (out / "split_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest
