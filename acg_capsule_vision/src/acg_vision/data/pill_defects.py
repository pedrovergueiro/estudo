"""Pill-Defects (PerceptiLabs, licença DESCONHECIDA): classificação normal × defeito.

Arquivos `pic.<sessão>.<quadro>.<k>.png`, 512×512, tons de cinza, vista de topo de
COMPRIMIDOS redondos (não cápsulas). Medição feita neste projeto: quadros contíguos
da mesma sessão diferem apenas por ruído (MAE ≈ 1 nível de cinza) — são o MESMO
comprimido físico. As 355 imagens correspondem a 10 unidades físicas (2 normais,
8 defeituosas). Por isso a avaliação é por unidade (deixa-uma-unidade-de-fora).
"""

from __future__ import annotations

import csv
import json
import os
import re
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import cv2
import numpy as np

NAME_RE = re.compile(r"pic\.(\d+)\.(\d+)\.(\d+)\.png$")
CLASSES = ("defect", "normal")  # ordem alfabética = índices da Ultralytics


@dataclass
class Unit:
    unit_id: str
    label: str
    session: int
    frames: list[int] = field(default_factory=list)
    images: list[Path] = field(default_factory=list)
    max_mae_to_first: float = 0.0


def _load(p: Path) -> np.ndarray:
    img = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"imagem ilegível: {p}")
    return img.astype(np.float32)


def group_units(raw: Path, max_mae: float = 3.0) -> list[Unit]:
    """Agrupa quadros em unidades físicas: mesma classe e sessão, índices contíguos e
    diferença média absoluta entre quadros consecutivos < `max_mae`."""
    items: dict[tuple[str, int], list[tuple[int, Path]]] = {}
    for label in CLASSES:
        for p in sorted((raw / label).glob("*.png")):
            m = NAME_RE.search(p.name)
            if not m:
                raise ValueError(f"nome fora do padrão: {p.name}")
            items.setdefault((label, int(m.group(1))), []).append((int(m.group(2)), p))
    units: list[Unit] = []
    for (label, session), seq in sorted(items.items()):
        seq.sort()
        cur: list[tuple[int, Path]] = [seq[0]]
        prev_img = _load(seq[0][1])
        for idx, p in seq[1:]:
            img = _load(p)
            if idx == cur[-1][0] + 1 and float(np.abs(img - prev_img).mean()) < max_mae:
                cur.append((idx, p))
            else:
                units.append(_make_unit(label, session, cur))
                cur = [(idx, p)]
            prev_img = img
        units.append(_make_unit(label, session, cur))
    return units


def _make_unit(label: str, session: int, seq: list[tuple[int, Path]]) -> Unit:
    first = _load(seq[0][1])
    mae = max(float(np.abs(_load(p) - first).mean()) for _, p in seq)
    return Unit(f"{label}-s{session}-f{seq[0][0]}-{seq[-1][0]}", label, session, [i for i, _ in seq],
                [p for _, p in seq], round(mae, 3))


def write_manifest(units: list[Unit], raw: Path, out: Path) -> dict[str, Any]:
    out.mkdir(parents=True, exist_ok=True)
    listed = set()
    csv_path = raw / "data.csv"
    if csv_path.exists():
        listed = {r["images"] for r in csv.DictReader(open(csv_path, encoding="utf-8"))}
    with open(out / "units.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["image", "label", "unit_id", "session", "frame", "in_original_data_csv"])
        for u in units:
            for f, p in zip(u.frames, u.images):
                rel = f"{u.label}/{p.name}"
                w.writerow([rel, u.label, u.unit_id, u.session, f, rel in listed])
    summary = {
        "dataset": "pill_defects", "n_images": sum(len(u.images) for u in units), "n_units": len(units),
        "units": [{"unit_id": u.unit_id, "label": u.label, "n_frames": len(u.images),
                   "max_mae_to_first_frame": u.max_mae_to_first} for u in units],
        "images_per_class": {c: sum(len(u.images) for u in units if u.label == c) for c in CLASSES},
        "units_per_class": {c: sum(1 for u in units if u.label == c) for c in CLASSES},
        "original_data_csv_rows": len(listed),
    }
    (out / "units.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    return summary


def _link(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.symlink(src.resolve(), dst)
    except OSError:
        shutil.copy2(src, dst)


def build_fold(units: list[Unit], test_unit: str, out: Path, val_tail: float = 0.2) -> dict[str, Any]:
    """Dobra LOUO: a unidade `test_unit` vai inteira para teste.

    Validação (só para early stopping/seleção do best.pt): os últimos `val_tail` quadros
    de CADA unidade de treino. É uma validação OTIMISTA (mesmas unidades do treino) —
    com só 2 unidades normais não há como reservar uma unidade normal para validação
    em todas as dobras. A métrica que vale é a do teste (unidade nunca vista).
    """
    if out.exists():
        shutil.rmtree(out)
    counts = {"train": {c: 0 for c in CLASSES}, "val": {c: 0 for c in CLASSES}, "test": {c: 0 for c in CLASSES}}
    for u in units:
        if u.unit_id == test_unit:  # teste fica FORA do diretório lido pela Ultralytics (só contagem)
            counts["test"][u.label] += len(u.images)
            continue
        k = max(1, int(round(len(u.images) * val_tail)))
        for i, p in enumerate(u.images):
            split = "val" if i >= len(u.images) - k else "train"
            _link(p, out / split / u.label / p.name)
            counts[split][u.label] += 1
    for split in ("train", "val"):
        for c in CLASSES:
            (out / split / c).mkdir(parents=True, exist_ok=True)
    return {"test_unit": test_unit, "counts": counts}
