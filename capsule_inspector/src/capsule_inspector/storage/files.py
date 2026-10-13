"""Escrita atômica de arquivos (nada de imagens/JSON pela metade após queda de energia)."""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Any

import cv2
import numpy as np


class StorageError(RuntimeError):
    pass


def _fsync_dir(d: Path) -> None:
    try:
        fd = os.open(str(d), os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)
    except OSError:
        pass


def atomic_write_bytes(path: Path, data: bytes) -> None:
    path = Path(path)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_name(f".{path.name}.tmp")
        with open(tmp, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp, path)
        _fsync_dir(path.parent)
    except OSError as e:
        raise StorageError(f"falha ao gravar {path}: {e}") from e


def atomic_write_json(path: Path, obj: Any) -> None:
    atomic_write_bytes(path, json.dumps(obj, ensure_ascii=False, indent=1, default=str).encode("utf-8"))


def atomic_write_image(path: Path, image: np.ndarray, jpeg_quality: int = 92) -> None:
    ext = Path(path).suffix.lower()
    params = [cv2.IMWRITE_JPEG_QUALITY, int(jpeg_quality)] if ext in (".jpg", ".jpeg") else []
    ok, buf = cv2.imencode(ext, image, params)
    if not ok:
        raise StorageError(f"falha ao codificar imagem {path}")
    atomic_write_bytes(path, buf.tobytes())


def free_disk_gb(path: Path) -> float:
    p = Path(path)
    while not p.exists() and p != p.parent:
        p = p.parent
    return shutil.disk_usage(p).free / 1e9
