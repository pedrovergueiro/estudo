"""Validação de datasets no formato YOLO.

Verifica: arquivos corrompidos, duplicatas exatas e quase idênticas, rótulos
ausentes/inválidos, caixas fora da imagem, classes inconsistentes, distribuição
por classe, resolução/proporção, desequilíbrio e vazamento entre splits (por
conteúdo e por grupo físico de metadados).
"""

from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..config import DatasetValidationConfig
from .hashing import file_sha256, near_duplicate_pairs, thumbnail_signature
from .metadata import rel_key
from .yolo_io import LabelParseError, label_path_for, list_images, read_label_file

SPLITS = ("train", "val", "test")
COORD_TOL = 1e-3


def infer_split(path: Path) -> str | None:
    for part in path.parts:
        if part in SPLITS:
            return part
        if part == "valid":
            return "val"
    return None


@dataclass
class Issue:
    severity: str  # error | warning
    code: str
    path: str
    detail: str

    def as_dict(self) -> dict[str, str]:
        return {"severity": self.severity, "code": self.code, "path": self.path, "detail": self.detail}


@dataclass
class ImageInfo:
    path: Path
    key: str
    split: str | None
    width: int = 0
    height: int = 0
    sha256: str = ""
    signature: np.ndarray | None = None
    n_labels: int = 0
    classes: list[int] = field(default_factory=list)
    box_areas_px: list[float] = field(default_factory=list)


@dataclass
class ValidationReport:
    root: str
    task: str
    class_names: list[str]
    n_images: int = 0
    n_labels: int = 0
    issues: list[Issue] = field(default_factory=list)
    class_instances: dict[str, int] = field(default_factory=dict)
    class_images: dict[str, int] = field(default_factory=dict)
    per_split_instances: dict[str, dict[str, int]] = field(default_factory=dict)
    split_counts: dict[str, int] = field(default_factory=dict)
    resolution: dict[str, Any] = field(default_factory=dict)
    imbalance_ratio: float | None = None
    exact_duplicate_groups: list[list[str]] = field(default_factory=list)
    near_duplicate_pairs: list[tuple[str, str, int]] = field(default_factory=list)
    leakage: list[dict[str, Any]] = field(default_factory=list)
    small_object_fraction: dict[str, float] = field(default_factory=dict)

    @property
    def errors(self) -> list[Issue]:
        return [i for i in self.issues if i.severity == "error"]

    @property
    def warnings(self) -> list[Issue]:
        return [i for i in self.issues if i.severity == "warning"]

    @property
    def ok(self) -> bool:
        return not self.errors and not self.leakage

    def as_dict(self) -> dict[str, Any]:
        codes = Counter(i.code for i in self.issues)
        return {
            "root": self.root, "task": self.task, "ok": self.ok,
            "class_names": self.class_names, "n_images": self.n_images, "n_labels": self.n_labels,
            "n_errors": len(self.errors), "n_warnings": len(self.warnings),
            "issue_counts": dict(codes),
            "issues": [i.as_dict() for i in self.issues],
            "class_instances": self.class_instances, "class_images": self.class_images,
            "per_split_instances": self.per_split_instances, "split_counts": self.split_counts,
            "resolution": self.resolution, "imbalance_ratio": self.imbalance_ratio,
            "exact_duplicate_groups": self.exact_duplicate_groups,
            "near_duplicate_pairs": [list(p) for p in self.near_duplicate_pairs],
            "leakage": self.leakage,
            "small_object_fraction": self.small_object_fraction,
        }


def _check_image(info: ImageInfo, report: ValidationReport) -> np.ndarray | None:
    try:
        data = np.fromfile(str(info.path), dtype=np.uint8)
        img = cv2.imdecode(data, cv2.IMREAD_UNCHANGED) if data.size else None
    except Exception as e:  # pragma: no cover - erros de E/S raros
        report.issues.append(Issue("error", "IMAGE_UNREADABLE", info.key, str(e)))
        return None
    if img is None or img.size == 0:
        report.issues.append(Issue("error", "IMAGE_CORRUPT", info.key, "falha ao decodificar"))
        return None
    info.height, info.width = img.shape[:2]
    if img.ndim == 3 and img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    if img.dtype != np.uint8:
        report.issues.append(Issue("warning", "IMAGE_NOT_8BIT", info.key, str(img.dtype)))
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    return img


def _check_labels(info: ImageInfo, report: ValidationReport, n_classes: int,
                  cfg: DatasetValidationConfig, task: str) -> None:
    lp = label_path_for(info.path)
    if not lp.exists():
        report.issues.append(Issue("warning", "LABEL_MISSING", info.key,
                                   "sem arquivo de rótulo (tratada como imagem sem objetos?)"))
        return
    try:
        anns = read_label_file(lp)
    except LabelParseError as e:
        report.issues.append(Issue("error", "LABEL_INVALID", info.key, str(e)))
        return
    except UnicodeDecodeError:
        report.issues.append(Issue("error", "LABEL_INVALID", info.key, "codificação inválida"))
        return
    seen: set[tuple] = set()
    for k, a in enumerate(anns):
        if a.class_id >= n_classes:
            report.issues.append(Issue("error", "CLASS_OUT_OF_RANGE", info.key,
                                       f"objeto {k}: classe {a.class_id} >= {n_classes}"))
            continue
        if task == "segment" and a.polygon is None:
            report.issues.append(Issue("warning", "SEG_WITHOUT_POLYGON", info.key, f"objeto {k}"))
        x1, y1 = a.cx - a.w / 2, a.cy - a.h / 2
        x2, y2 = a.cx + a.w / 2, a.cy + a.h / 2
        coords = [x1, y1, x2, y2] + ([c for p in a.polygon for c in p] if a.polygon else [])
        if min(coords) < -COORD_TOL or max(coords) > 1 + COORD_TOL:
            report.issues.append(Issue("error", "BOX_OUT_OF_BOUNDS", info.key,
                                       f"objeto {k}: coordenadas fora de [0,1]"))
        if a.w <= 0 or a.h <= 0:
            report.issues.append(Issue("error", "BOX_DEGENERATE", info.key, f"objeto {k}: w/h <= 0"))
            continue
        if info.width and (a.w * info.width < cfg.min_box_size_px or a.h * info.height < cfg.min_box_size_px):
            report.issues.append(Issue("warning", "BOX_TOO_SMALL", info.key,
                                       f"objeto {k}: {a.w * info.width:.1f}x{a.h * info.height:.1f}px"))
        sig = (a.class_id, round(a.cx, 4), round(a.cy, 4), round(a.w, 4), round(a.h, 4))
        if sig in seen:
            report.issues.append(Issue("warning", "LABEL_DUPLICATE_BOX", info.key, f"objeto {k}"))
        seen.add(sig)
        info.classes.append(a.class_id)
        if info.width:
            info.box_areas_px.append(a.w * info.width * a.h * info.height)
    info.n_labels = len(anns)


def validate_dataset(root: Path, class_names: list[str], cfg: DatasetValidationConfig,
                     task: str = "detect", metadata: dict[str, dict[str, str]] | None = None,
                     split_of: dict[str, str] | None = None,
                     group_columns: tuple[str, ...] = ("unit_id", "lot", "session")) -> ValidationReport:
    """Valida o dataset em `root`.

    `split_of` permite informar o split de cada imagem (chave relativa); se ausente,
    o split é inferido do caminho (images/train/...).
    """
    root = Path(root)
    report = ValidationReport(root=str(root), task=task, class_names=list(class_names))
    images = list_images(root)
    report.n_images = len(images)
    if not images:
        report.issues.append(Issue("error", "NO_IMAGES", str(root), "nenhuma imagem encontrada"))
        return report

    lbl_root = root / "labels"
    if lbl_root.is_dir():
        expected = {label_path_for(p).resolve() for p in images}
        for lp in lbl_root.rglob("*.txt"):
            if lp.resolve() not in expected:
                report.issues.append(Issue("warning", "LABEL_ORPHAN", rel_key(lp, root),
                                           "rótulo sem imagem correspondente"))

    infos: list[ImageInfo] = []
    for p in images:
        key = rel_key(p, root)
        split = (split_of or {}).get(key) or infer_split(p.relative_to(root))
        info = ImageInfo(path=p, key=key, split=split)
        img = _check_image(info, report)
        if img is None:
            continue
        info.sha256 = file_sha256(p)
        info.signature = thumbnail_signature(img)
        ar = max(info.width, info.height) / max(1, min(info.width, info.height))
        if ar > cfg.max_aspect_ratio_image:
            report.issues.append(Issue("warning", "ASPECT_RATIO", key, f"proporção {ar:.2f}"))
        _check_labels(info, report, len(class_names), cfg, task)
        infos.append(info)

    # ---- distribuição
    inst: Counter[int] = Counter()
    imgs_per: Counter[int] = Counter()
    per_split: dict[str, Counter[int]] = defaultdict(Counter)
    for info in infos:
        inst.update(info.classes)
        imgs_per.update(set(info.classes))
        per_split[info.split or "unsplit"].update(info.classes)
        report.n_labels += info.n_labels
    report.class_instances = {n: int(inst.get(i, 0)) for i, n in enumerate(class_names)}
    report.class_images = {n: int(imgs_per.get(i, 0)) for i, n in enumerate(class_names)}
    report.per_split_instances = {s: {n: int(c.get(i, 0)) for i, n in enumerate(class_names)}
                                  for s, c in sorted(per_split.items())}
    report.split_counts = dict(Counter(i.split or "unsplit" for i in infos))
    counts = [c for c in report.class_instances.values()]
    nonzero = [c for c in counts if c > 0]
    if nonzero:
        report.imbalance_ratio = round(max(nonzero) / min(nonzero), 3)
        if report.imbalance_ratio > cfg.imbalance_warning_ratio:
            report.issues.append(Issue("warning", "CLASS_IMBALANCE", str(root),
                                       f"razão max/min = {report.imbalance_ratio}"))
    for name, c in report.class_instances.items():
        if c < cfg.min_instances_per_enabled_class:
            report.issues.append(Issue("warning", "INSUFFICIENT_DATA", name,
                                       f"{c} instâncias (< {cfg.min_instances_per_enabled_class}); "
                                       "classe não pode ser validada"))

    # ---- objetos pequenos (COCO: área < 32² px)
    for i, n in enumerate(class_names):
        areas = [a for info in infos for c, a in zip(info.classes, info.box_areas_px) if c == i]
        if areas:
            report.small_object_fraction[n] = round(float(np.mean(np.array(areas) < 32 * 32)), 4)

    # ---- resolução
    if infos:
        ws = np.array([i.width for i in infos])
        hs = np.array([i.height for i in infos])
        res = Counter(f"{w}x{h}" for w, h in zip(ws, hs))
        report.resolution = {
            "width": {"min": int(ws.min()), "median": float(np.median(ws)), "max": int(ws.max())},
            "height": {"min": int(hs.min()), "median": float(np.median(hs)), "max": int(hs.max())},
            "distinct": len(res), "most_common": res.most_common(5),
        }

    # ---- duplicatas exatas
    by_sha: dict[str, list[ImageInfo]] = defaultdict(list)
    for info in infos:
        by_sha[info.sha256].append(info)
    for group in by_sha.values():
        if len(group) > 1:
            report.exact_duplicate_groups.append([g.key for g in group])
            report.issues.append(Issue("warning", "DUPLICATE_EXACT", group[0].key,
                                       f"{len(group)} cópias idênticas"))
            splits = {g.split for g in group}
            if len(splits) > 1:
                report.leakage.append({"type": "exact_duplicate", "images": [g.key for g in group],
                                       "splits": sorted(s or "unsplit" for s in splits)})

    # ---- quase duplicatas
    hashes = [i.signature if i.signature is not None else np.zeros(32 * 32, np.float32) for i in infos]
    for a, b, d in near_duplicate_pairs(hashes, cfg.near_duplicate_ncc):
        ia, ib = infos[a], infos[b]
        if ia.sha256 == ib.sha256:
            continue
        report.near_duplicate_pairs.append((ia.key, ib.key, d))
        if ia.split and ib.split and ia.split != ib.split:
            report.leakage.append({"type": "near_duplicate", "images": [ia.key, ib.key],
                                   "splits": [ia.split, ib.split], "ncc": d})

    # ---- vazamento por grupo físico (metadados)
    if metadata:
        for col in group_columns:
            where: dict[str, set[str]] = defaultdict(set)
            for info in infos:
                v = metadata.get(info.key, {}).get(col, "")
                if v and info.split:
                    where[v].add(info.split)
            for v, splits in where.items():
                if len(splits) > 1:
                    report.leakage.append({"type": f"group_{col}", "value": v, "splits": sorted(splits)})
            if where:
                break  # usa a coluna de agrupamento mais específica disponível
        missing_meta = [i.key for i in infos if i.key not in metadata]
        if missing_meta:
            report.issues.append(Issue("warning", "METADATA_MISSING", str(root),
                                       f"{len(missing_meta)} imagens sem metadados"))
    else:
        report.issues.append(Issue("warning", "METADATA_ABSENT", str(root),
                                   "sem metadata.csv: divisão por unidade física/lote não verificável"))
    return report
