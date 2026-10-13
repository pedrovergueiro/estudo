"""Interface comum de fontes de imagem e controle de iluminação."""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod

import numpy as np

from ..config import AcquisitionStep
from ..types import Frame

log = logging.getLogger("capsule_inspector.capture")


class CaptureError(RuntimeError):
    """Falha de captura (câmera desconectada, timeout, quadro vazio)."""


class EndOfStream(CaptureError):
    """Fonte de arquivos esgotada (não é falha de hardware)."""


class FrameSource(ABC):
    name = "base"

    def __init__(self) -> None:
        self._frame_id = 0
        self.opened = False

    @abstractmethod
    def open(self) -> None: ...

    @abstractmethod
    def _read(self) -> np.ndarray: ...

    @abstractmethod
    def close(self) -> None: ...

    def read(self, view: str = "default") -> Frame:
        if not self.opened:
            raise CaptureError(f"{self.name}: fonte não aberta")
        t0 = time.perf_counter()
        img = self._read()
        if img is None or getattr(img, "size", 0) == 0:
            raise CaptureError(f"{self.name}: quadro vazio")
        self._frame_id += 1
        return Frame(image=img, timestamp=time.time(), frame_id=self._frame_id, source=self.name,
                     view=view, capture_ms=(time.perf_counter() - t0) * 1000.0)

    def describe(self) -> dict:
        return {"type": self.name, "opened": self.opened}

    def __enter__(self) -> FrameSource:
        self.open()
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()


class LightingController(ABC):
    """Liga o canal de iluminação de cada etapa de aquisição."""

    @abstractmethod
    def set_light(self, step: AcquisitionStep) -> None: ...

    def all_off(self) -> None:
        pass


class NullLightingController(LightingController):
    """Sem controle físico (iluminação fixa ou manual). Apenas registra."""

    def set_light(self, step: AcquisitionStep) -> None:
        log.debug("iluminação: %s (%s) — sem controlador físico", step.name, step.light)


def capture_views(source: FrameSource, steps: list[AcquisitionStep], lighting: LightingController,
                  settle_s: float = 0.0) -> list[Frame]:
    """Adquire uma imagem por etapa de iluminação, todas da mesma unidade física."""
    frames = []
    try:
        for step in steps:
            lighting.set_light(step)
            if settle_s:
                time.sleep(settle_s)
            frames.append(source.read(view=step.name))
    finally:
        lighting.all_off()
    return frames
