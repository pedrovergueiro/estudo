"""Metadados por imagem (unidade física, lote, sessão, acabamento, cor, iluminação)."""

from __future__ import annotations

import csv
from pathlib import Path

STRATA_COLUMNS = ("finish", "color", "lot", "lighting", "profile")


def load_metadata(csv_path: Path | None, root: Path) -> dict[str, dict[str, str]]:
    """Retorna {caminho relativo da imagem (posix): {coluna: valor}}."""
    if csv_path is None or not Path(csv_path).exists():
        return {}
    out: dict[str, dict[str, str]] = {}
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if reader.fieldnames is None or "image" not in reader.fieldnames:
            raise ValueError(f"{csv_path}: coluna obrigatória 'image' ausente")
        for row in reader:
            key = Path(row["image"]).as_posix()
            out[key] = {k: (v or "").strip() for k, v in row.items() if k is not None}
    return out


def write_metadata(csv_path: Path, rows: list[dict[str, str]], columns: list[str]) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=columns, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in columns})


def rel_key(image: Path, root: Path) -> str:
    try:
        return image.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return image.as_posix()
