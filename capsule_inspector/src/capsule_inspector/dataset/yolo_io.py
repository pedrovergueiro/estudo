"""Leitura e escrita de anotações no formato YOLO (detecção e segmentação)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}


@dataclass
class YoloAnnotation:
    class_id: int
    cx: float
    cy: float
    w: float
    h: float
    polygon: list[tuple[float, float]] | None = None  # normalizado [0,1]

    def to_line(self, task: str = "detect") -> str:
        if task == "segment" and self.polygon:
            pts = " ".join(f"{x:.6f} {y:.6f}" for x, y in self.polygon)
            return f"{self.class_id} {pts}"
        return f"{self.class_id} {self.cx:.6f} {self.cy:.6f} {self.w:.6f} {self.h:.6f}"

    def xyxy(self, width: int, height: int) -> tuple[float, float, float, float]:
        return ((self.cx - self.w / 2) * width, (self.cy - self.h / 2) * height,
                (self.cx + self.w / 2) * width, (self.cy + self.h / 2) * height)


class LabelParseError(ValueError):
    pass


def parse_label_line(line: str, lineno: int = 0) -> YoloAnnotation:
    parts = line.split()
    if len(parts) < 5:
        raise LabelParseError(f"linha {lineno}: esperado >= 5 campos, obtido {len(parts)}")
    try:
        cid_f = float(parts[0])
        vals = [float(v) for v in parts[1:]]
    except ValueError as e:
        raise LabelParseError(f"linha {lineno}: valor não numérico") from e
    if not cid_f.is_integer() or cid_f < 0:
        raise LabelParseError(f"linha {lineno}: id de classe inválido {parts[0]}")
    cid = int(cid_f)
    if any(v != v for v in vals):  # NaN
        raise LabelParseError(f"linha {lineno}: NaN")
    if len(vals) == 4:
        cx, cy, w, h = vals
        return YoloAnnotation(cid, cx, cy, w, h)
    if len(vals) % 2 != 0 or len(vals) < 6:
        raise LabelParseError(f"linha {lineno}: polígono precisa de >= 3 pontos (x y)")
    pts = [(vals[i], vals[i + 1]) for i in range(0, len(vals), 2)]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x1, x2, y1, y2 = min(xs), max(xs), min(ys), max(ys)
    return YoloAnnotation(cid, (x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1, polygon=pts)


def read_label_file(path: Path) -> list[YoloAnnotation]:
    anns: list[YoloAnnotation] = []
    with open(path, encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            anns.append(parse_label_line(line, i))
    return anns


def write_label_file(path: Path, anns: list[YoloAnnotation], task: str = "detect") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        for a in anns:
            fh.write(a.to_line(task) + "\n")
    os.replace(tmp, path)


def label_path_for(image_path: Path) -> Path:
    """Mesma convenção da Ultralytics: troca o último '/images/' por '/labels/'."""
    s = str(image_path)
    sep = os.sep
    key = f"{sep}images{sep}"
    idx = s.rfind(key)
    if idx < 0:
        return image_path.with_suffix(".txt")
    return Path(s[:idx] + f"{sep}labels{sep}" + s[idx + len(key):]).with_suffix(".txt")


def list_images(root: Path) -> list[Path]:
    base = root / "images" if (root / "images").is_dir() else root
    return sorted(p for p in base.rglob("*") if p.suffix.lower() in IMAGE_EXTS and p.is_file())
