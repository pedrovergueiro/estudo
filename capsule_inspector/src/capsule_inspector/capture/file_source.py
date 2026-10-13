"""Imagens ou vídeos gravados — para testes, bancada e reprocessamento."""

from __future__ import annotations

import glob
from pathlib import Path

import cv2
import numpy as np

from ..dataset.yolo_io import IMAGE_EXTS
from .base import CaptureError, CorruptFrame, EndOfStream, FrameSource

VIDEO_EXTS = {".mp4", ".avi", ".mkv", ".mov"}


class FileSource(FrameSource):
    name = "file"

    def __init__(self, path: str | Path, pattern: str = "*.png", loop: bool = False):
        super().__init__()
        self.path = Path(path)
        self.pattern = pattern
        self.loop = loop
        self.files: list[Path] = []
        self.idx = 0
        self.video: cv2.VideoCapture | None = None
        self.current: Path | None = None

    def open(self) -> None:
        if self.path.is_file() and self.path.suffix.lower() in VIDEO_EXTS:
            self.video = cv2.VideoCapture(str(self.path))
            if not self.video.isOpened():
                raise CaptureError(f"vídeo ilegível: {self.path}")
        elif self.path.is_file():
            self.files = [self.path]
        elif self.path.is_dir():
            self.files = sorted(p for p in self.path.glob(self.pattern) if p.suffix.lower() in IMAGE_EXTS)
            if not self.files:
                raise CaptureError(f"nenhuma imagem '{self.pattern}' em {self.path}")
        else:
            self.files = sorted(Path(p) for p in glob.glob(str(self.path)) if Path(p).suffix.lower() in IMAGE_EXTS)
            if not self.files:
                raise CaptureError(f"caminho inexistente: {self.path}")
        self.idx = 0
        self.opened = True

    def _read(self) -> np.ndarray:
        if self.video is not None:
            ok, img = self.video.read()
            if not ok:
                if self.loop:
                    self.video.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ok, img = self.video.read()
                if not ok:
                    raise EndOfStream("fim do vídeo")
            return img
        if self.idx >= len(self.files):
            if not self.loop:
                raise EndOfStream("fim da lista de imagens")
            self.idx = 0
        p = self.files[self.idx]
        self.idx += 1
        self.current = p
        img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise CorruptFrame(f"imagem corrompida ou ilegível: {p}")
        return img

    def read(self, view: str = "default"):
        f = super().read(view)
        if self.current is not None:
            f.meta["file"] = str(self.current)
        return f

    def close(self) -> None:
        if self.video is not None:
            self.video.release()
        self.video = None
        self.opened = False

    def describe(self) -> dict:
        return {**super().describe(), "path": str(self.path), "n_files": len(self.files)}
