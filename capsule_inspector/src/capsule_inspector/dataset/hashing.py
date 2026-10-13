"""Hashes exatos e perceptuais para detectar duplicatas e vazamento entre splits."""

from __future__ import annotations

import hashlib
from pathlib import Path

import cv2
import numpy as np


def file_sha256(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        while True:
            b = fh.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


THUMB_SIZE = 32


def thumbnail_signature(image: np.ndarray, size: int = THUMB_SIZE) -> np.ndarray:
    """Miniatura em cinza, média zero e norma 1 (para correlação normalizada).

    Escolhida em vez de dHash: em estação fixa com fundo plano, o dHash inverte
    muitos bits com ruído leve e cápsulas diferentes colidem. A correlação de
    miniaturas tolera ruído, JPEG, brilho e deslocamentos de poucos pixels.
    """
    gray = image if image.ndim == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    t = cv2.resize(gray, (size, size), interpolation=cv2.INTER_AREA).astype(np.float32).ravel()
    t -= t.mean()
    n = float(np.linalg.norm(t))
    return t / n if n > 0 else t


def near_duplicate_pairs(sigs: list[np.ndarray], min_ncc: float, chunk: int = 1024
                         ) -> list[tuple[int, int, float]]:
    """Pares (i, j, ncc) com correlação normalizada >= min_ncc."""
    if len(sigs) < 2:
        return []
    m = np.stack(sigs).astype(np.float32)
    pairs: list[tuple[int, int, float]] = []
    for s0 in range(0, len(m), chunk):
        c = m[s0:s0 + chunk] @ m.T
        ii, jj = np.nonzero(c >= min_ncc)
        for i, j in zip(ii, jj):
            gi = s0 + int(i)
            if int(j) > gi:
                pairs.append((gi, int(j), round(float(c[i, j]), 5)))
    return pairs


def read_for_hash(path) -> np.ndarray | None:
    """Leitura única usada por validação e divisão (mesmo hash nos dois lugares)."""
    data = np.fromfile(str(path), dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR) if data.size else None


class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[max(ra, rb)] = min(ra, rb)
