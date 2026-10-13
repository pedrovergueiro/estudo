"""Divisão treino/validação/teste por grupo físico (unidade, lote, sessão).

Todas as imagens de uma mesma unidade física (todas as vistas e iluminações)
ficam no mesmo split. Imagens quase idênticas são fundidas no mesmo grupo
mesmo que os metadados divirjam (correlação de miniaturas). A atribuição dos grupos é gulosa e
estratificada pela classe mais rara de cada grupo, determinística pela seed.
"""

from __future__ import annotations

import json
import random
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import yaml

from ..config import SplitConfig
from .hashing import UnionFind, near_duplicate_pairs, read_for_hash, thumbnail_signature
from .metadata import rel_key
from .yolo_io import label_path_for, list_images, read_label_file

SPLITS = ("train", "val", "test")


@dataclass
class SplitResult:
    assignment: dict[str, str]           # chave da imagem -> split
    groups: dict[str, list[str]]         # id do grupo -> chaves
    group_split: dict[str, str]
    grouping_column: str | None
    warnings: list[str]
    class_counts: dict[str, dict[str, int]]

    def as_dict(self) -> dict[str, Any]:
        return {
            "n_images": len(self.assignment),
            "n_groups": len(self.groups),
            "grouping_column": self.grouping_column,
            "split_images": dict(Counter(self.assignment.values())),
            "split_groups": dict(Counter(self.group_split.values())),
            "class_counts": self.class_counts,
            "warnings": self.warnings,
        }


def _image_classes(img: Path) -> list[int]:
    lp = label_path_for(img)
    if not lp.exists():
        return []
    try:
        return [a.class_id for a in read_label_file(lp)]
    except ValueError:
        return []


def group_aware_split(root: Path, class_names: list[str], cfg: SplitConfig,
                      metadata: dict[str, dict[str, str]] | None = None) -> SplitResult:
    root = Path(root)
    images = list_images(root)
    if not images:
        raise ValueError(f"nenhuma imagem em {root}")
    metadata = metadata or {}
    keys = [rel_key(p, root) for p in images]
    warnings: list[str] = []

    # 1) coluna de agrupamento
    col_used = None
    for col in cfg.group_by:
        filled = sum(1 for k in keys if metadata.get(k, {}).get(col))
        if filled:
            col_used = col
            if filled < len(keys):
                warnings.append(f"{len(keys) - filled} imagens sem '{col}': viram grupos unitários")
            break
    if col_used is None:
        warnings.append("nenhuma coluna de agrupamento nos metadados: cada imagem é um grupo; "
                        "vazamento por unidade física NÃO pode ser excluído")

    raw_group = []
    for k in keys:
        v = metadata.get(k, {}).get(col_used, "") if col_used else ""
        raw_group.append(f"{col_used}={v}" if v else f"image={k}")

    # 2) união por grupo de metadados + quase duplicatas
    uf = UnionFind(len(keys))
    first_of: dict[str, int] = {}
    for i, g in enumerate(raw_group):
        if g in first_of:
            uf.union(first_of[g], i)
        else:
            first_of[g] = i
    hashes = []
    for p in images:
        img = read_for_hash(p)
        hashes.append(thumbnail_signature(img) if img is not None else np.zeros(32 * 32, np.float32))
    merged = 0
    for a, b, _ in near_duplicate_pairs(hashes, cfg.near_duplicate_ncc):
        if uf.find(a) != uf.find(b):
            uf.union(a, b)
            merged += 1
    if merged:
        warnings.append(f"{merged} fusões de grupos por quase-duplicata (dHash <= {cfg.near_duplicate_ncc})")

    groups: dict[str, list[int]] = defaultdict(list)
    for i in range(len(keys)):
        groups[raw_group[uf.find(i)]].append(i)

    classes = [_image_classes(p) for p in images]
    total = Counter(c for cl in classes for c in cl)

    # 3) lotes reservados para teste
    group_split: dict[str, str] = {}
    holdout = set(cfg.holdout_lots)
    if holdout:
        for gid, idxs in groups.items():
            lots = {metadata.get(keys[i], {}).get("lot", "") for i in idxs}
            if lots & holdout:
                group_split[gid] = "test"

    # 4) atribuição gulosa estratificada
    rng = random.Random(cfg.seed)
    order = [g for g in groups if g not in group_split]
    rng.shuffle(order)

    def rarest(gid: str) -> tuple[int, int]:
        cls = Counter(c for i in groups[gid] for c in classes[i])
        if not cls:
            return (10**9, 0)
        c = min(cls, key=lambda k: (total[k], k))
        return (total[c], -len(groups[gid]))

    order.sort(key=rarest)
    n_img = {s: 0 for s in SPLITS}
    n_cls = {s: Counter() for s in SPLITS}
    for gid, s in group_split.items():
        n_img[s] += len(groups[gid])
        for i in groups[gid]:
            n_cls[s].update(classes[i])
    n_total = len(keys)
    for gid in order:
        cls = Counter(c for i in groups[gid] for c in classes[i])
        size = len(groups[gid])

        def deficit(s: str) -> tuple[float, float]:
            r = cfg.ratios[s]
            if r <= 0:
                return (-1e18, -1e18)
            img_def = (r * n_total - n_img[s]) / (r * n_total)
            if cls:
                c = min(cls, key=lambda k: (total[k], k))
                cls_def = (r * total[c] - n_cls[s][c]) / max(1e-9, r * total[c])
            else:
                cls_def = img_def
            return (cls_def, img_def)

        best = max(SPLITS, key=lambda s: (deficit(s), -SPLITS.index(s)))
        group_split[gid] = best
        n_img[best] += size
        n_cls[best].update(cls)

    assignment = {keys[i]: group_split[gid] for gid, idxs in groups.items() for i in idxs}
    for s in SPLITS:
        if cfg.ratios[s] > 0 and n_img[s] == 0:
            warnings.append(f"split '{s}' vazio: dados insuficientes para avaliação independente")
    for c in total:
        present = [s for s in SPLITS if n_cls[s][c] > 0]
        if "test" not in present and cfg.ratios["test"] > 0:
            warnings.append(f"classe '{class_names[c] if c < len(class_names) else c}' sem instâncias "
                            "no teste: não validável")
    class_counts = {s: {class_names[c] if c < len(class_names) else str(c): int(v)
                        for c, v in sorted(n_cls[s].items())} for s in SPLITS}
    return SplitResult(
        assignment=assignment,
        groups={gid: [keys[i] for i in idxs] for gid, idxs in groups.items()},
        group_split=group_split, grouping_column=col_used, warnings=warnings,
        class_counts=class_counts)


def write_split(result: SplitResult, root: Path, out_dir: Path, class_names: list[str],
                seed: int) -> Path:
    """Grava listas train/val/test.txt, data.yaml (Ultralytics) e manifesto."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    root = Path(root).resolve()
    for s in SPLITS:
        lines = sorted(str((root / k).resolve()) for k, v in result.assignment.items() if v == s)
        (out_dir / f"{s}.txt").write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
    data_yaml = {
        "path": str(root),
        "train": str((out_dir / "train.txt").resolve()),
        "val": str((out_dir / "val.txt").resolve()),
        "test": str((out_dir / "test.txt").resolve()),
        "names": {i: n for i, n in enumerate(class_names)},
    }
    p = out_dir / "data.yaml"
    p.write_text(yaml.safe_dump(data_yaml, sort_keys=False, allow_unicode=True), encoding="utf-8")
    manifest = {"seed": seed, **result.as_dict(), "group_split": result.group_split}
    (out_dir / "split_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False),
                                                 encoding="utf-8")
    return p


def read_split_lists(split_dir: Path, root: Path) -> dict[str, str]:
    """Lê train/val/test.txt e retorna {chave relativa: split}."""
    out: dict[str, str] = {}
    for s in SPLITS:
        f = Path(split_dir) / f"{s}.txt"
        if f.exists():
            for line in f.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    out[rel_key(Path(line.strip()), Path(root))] = s
    return out
