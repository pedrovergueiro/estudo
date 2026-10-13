"""Conversão de anotações Pascal VOC e COCO para YOLO (detecção/segmentação).

As classes externas são mapeadas para a taxonomia via `aliases`. Classes sem
correspondência NÃO são descartadas silenciosamente: aparecem no relatório e,
com `strict=True`, interrompem a conversão.
"""

from __future__ import annotations

import json
import shutil
import xml.etree.ElementTree as ET
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import Taxonomy
from .yolo_io import IMAGE_EXTS, YoloAnnotation, write_label_file


class ConversionError(RuntimeError):
    pass


@dataclass
class ConversionReport:
    source_format: str
    n_images: int = 0
    n_objects: int = 0
    mapped: Counter = field(default_factory=Counter)
    unmapped: Counter = field(default_factory=Counter)
    skipped: list[dict[str, str]] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {"source_format": self.source_format, "n_images": self.n_images,
                "n_objects": self.n_objects, "mapped": dict(self.mapped),
                "unmapped": dict(self.unmapped), "skipped": self.skipped}


def _class_index(tax: Taxonomy) -> dict[str, int]:
    return {n: i for i, n in enumerate(tax.training_names())}


def _map(name: str, tax: Taxonomy, idx: dict[str, int], overrides: dict[str, str] | None) -> int | None:
    key = (overrides or {}).get(name) or tax.resolve_alias(name)
    if key is None or key not in idx:
        return None
    return idx[key]


def _clip01(v: float) -> float:
    return min(1.0, max(0.0, v))


def _image_size(path: Path) -> tuple[int, int]:
    img = cv2.imdecode(np.fromfile(str(path), dtype=np.uint8), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ConversionError(f"imagem ilegível: {path}")
    return img.shape[1], img.shape[0]


def voc_box_to_yolo(xmin: float, ymin: float, xmax: float, ymax: float,
                    width: int, height: int) -> tuple[float, float, float, float]:
    """VOC usa pixels 1-based inclusivos; mesma convenção do conversor da Ultralytics."""
    xmin, xmax = max(1.0, xmin), min(float(width), xmax)
    ymin, ymax = max(1.0, ymin), min(float(height), ymax)
    cx = ((xmin + xmax) / 2.0 - 1.0) / width
    cy = ((ymin + ymax) / 2.0 - 1.0) / height
    return _clip01(cx), _clip01(cy), (xmax - xmin) / width, (ymax - ymin) / height


def convert_voc(xml_dir: Path, image_dir: Path, out_root: Path, tax: Taxonomy,
                class_overrides: dict[str, str] | None = None, include_difficult: bool = True,
                strict: bool = False) -> ConversionReport:
    rep = ConversionReport("voc")
    idx = _class_index(tax)
    for xml_path in sorted(Path(xml_dir).glob("*.xml")):
        try:
            root = ET.parse(xml_path).getroot()
        except ET.ParseError as e:
            rep.skipped.append({"file": xml_path.name, "reason": f"XML inválido: {e}"})
            continue
        fname = root.findtext("filename") or ""
        img_path = Path(image_dir) / fname
        if not img_path.exists():
            cands = [p for p in Path(image_dir).glob(xml_path.stem + ".*") if p.suffix.lower() in IMAGE_EXTS]
            if not cands:
                rep.skipped.append({"file": xml_path.name, "reason": "imagem não encontrada"})
                continue
            img_path = cands[0]
        size = root.find("size")
        try:
            w = int(size.findtext("width")) if size is not None else 0
            h = int(size.findtext("height")) if size is not None else 0
        except (TypeError, ValueError):
            w = h = 0
        rw, rh = _image_size(img_path)
        if (w, h) != (rw, rh):
            if w and h:
                rep.skipped.append({"file": xml_path.name,
                                    "reason": f"tamanho no XML {w}x{h} != imagem {rw}x{rh}; usando imagem"})
            w, h = rw, rh
        anns: list[YoloAnnotation] = []
        for obj in root.iter("object"):
            name = (obj.findtext("name") or "").strip()
            if not include_difficult and (obj.findtext("difficult") or "0").strip() == "1":
                continue
            cid = _map(name, tax, idx, class_overrides)
            if cid is None:
                rep.unmapped[name] += 1
                continue
            bb = obj.find("bndbox")
            if bb is None:
                rep.skipped.append({"file": xml_path.name, "reason": f"objeto {name} sem bndbox"})
                continue
            vals = [float(bb.findtext(k) or "nan") for k in ("xmin", "ymin", "xmax", "ymax")]
            if any(v != v for v in vals) or vals[2] <= vals[0] or vals[3] <= vals[1]:
                rep.skipped.append({"file": xml_path.name, "reason": f"caixa inválida {vals}"})
                continue
            cx, cy, bw, bh = voc_box_to_yolo(*vals, w, h)
            anns.append(YoloAnnotation(cid, cx, cy, bw, bh))
            rep.mapped[tax.training_names()[cid]] += 1
        _emit(img_path, anns, out_root, "detect")
        rep.n_images += 1
        rep.n_objects += len(anns)
    if strict and rep.unmapped:
        raise ConversionError(f"classes sem mapeamento: {dict(rep.unmapped)}")
    return rep


def _polygon_area(pts: list[float]) -> float:
    xs, ys = np.array(pts[0::2]), np.array(pts[1::2])
    return 0.5 * abs(float(np.dot(xs, np.roll(ys, 1)) - np.dot(ys, np.roll(xs, 1))))


def convert_coco(json_path: Path, image_dir: Path, out_root: Path, tax: Taxonomy,
                 task: str = "detect", class_overrides: dict[str, str] | None = None,
                 skip_crowd: bool = True, strict: bool = False) -> ConversionReport:
    rep = ConversionReport(f"coco_{task}")
    idx = _class_index(tax)
    with open(json_path, encoding="utf-8") as fh:
        coco = json.load(fh)
    cats = {c["id"]: c["name"] for c in coco.get("categories", [])}
    by_img: dict[int, list[dict]] = {}
    for a in coco.get("annotations", []):
        by_img.setdefault(a["image_id"], []).append(a)
    for im in coco.get("images", []):
        img_path = Path(image_dir) / im["file_name"]
        if not img_path.exists():
            rep.skipped.append({"file": im["file_name"], "reason": "imagem não encontrada"})
            continue
        w, h = int(im.get("width") or 0), int(im.get("height") or 0)
        if not w or not h:
            w, h = _image_size(img_path)
        anns: list[YoloAnnotation] = []
        for a in by_img.get(im["id"], []):
            if skip_crowd and a.get("iscrowd", 0):
                continue
            name = cats.get(a["category_id"], str(a["category_id"]))
            cid = _map(name, tax, idx, class_overrides)
            if cid is None:
                rep.unmapped[name] += 1
                continue
            x, y, bw, bh = (float(v) for v in a["bbox"])
            if bw <= 0 or bh <= 0:
                rep.skipped.append({"file": im["file_name"], "reason": f"bbox degenerada {a['bbox']}"})
                continue
            x1, y1 = max(0.0, x), max(0.0, y)
            x2, y2 = min(float(w), x + bw), min(float(h), y + bh)
            ann = YoloAnnotation(cid, (x1 + x2) / 2 / w, (y1 + y2) / 2 / h, (x2 - x1) / w, (y2 - y1) / h)
            if task == "segment":
                seg = a.get("segmentation")
                if not isinstance(seg, list) or not seg:
                    rep.skipped.append({"file": im["file_name"], "reason": "segmentação RLE/ausente ignorada"})
                    continue
                polys = [p for p in seg if len(p) >= 6]
                if not polys:
                    continue
                if len(polys) > 1:
                    rep.skipped.append({"file": im["file_name"],
                                        "reason": f"{len(polys)} polígonos; mantido o de maior área"})
                poly = max(polys, key=_polygon_area)
                ann.polygon = [(_clip01(poly[i] / w), _clip01(poly[i + 1] / h)) for i in range(0, len(poly), 2)]
            anns.append(ann)
            rep.mapped[tax.training_names()[cid]] += 1
        _emit(img_path, anns, out_root, task)
        rep.n_images += 1
        rep.n_objects += len(anns)
    if strict and rep.unmapped:
        raise ConversionError(f"classes sem mapeamento: {dict(rep.unmapped)}")
    return rep


def _emit(img_path: Path, anns: list[YoloAnnotation], out_root: Path, task: str) -> None:
    out_img = Path(out_root) / "images" / img_path.name
    out_lbl = Path(out_root) / "labels" / (img_path.stem + ".txt")
    out_img.parent.mkdir(parents=True, exist_ok=True)
    if out_img.exists() and out_img.resolve() != img_path.resolve():
        # nomes repetidos entre pastas de origem não podem se sobrescrever
        if out_img.stat().st_size != img_path.stat().st_size:
            raise ConversionError(f"colisão de nome de arquivo: {img_path.name}")
    shutil.copy2(img_path, out_img)
    write_label_file(out_lbl, anns, task)


def remap_yolo_dataset(src_root: Path, src_names: list[str], out_root: Path, tax: Taxonomy,
                       task: str = "detect", class_overrides: dict[str, str] | None = None) -> ConversionReport:
    """Re-mapeia um dataset YOLO externo (com sua própria lista de classes) para a taxonomia."""
    from .yolo_io import label_path_for, list_images, read_label_file

    rep = ConversionReport("yolo_remap")
    idx = _class_index(tax)
    lut = {i: _map(n, tax, idx, class_overrides) for i, n in enumerate(src_names)}
    for img in list_images(Path(src_root)):
        lp = label_path_for(img)
        anns = read_label_file(lp) if lp.exists() else []
        out: list[YoloAnnotation] = []
        for a in anns:
            new = lut.get(a.class_id)
            if new is None:
                rep.unmapped[src_names[a.class_id] if a.class_id < len(src_names) else str(a.class_id)] += 1
                continue
            a.class_id = new
            out.append(a)
            rep.mapped[tax.training_names()[new]] += 1
        _emit(img, out, out_root, task)
        rep.n_images += 1
        rep.n_objects += len(out)
    return rep
