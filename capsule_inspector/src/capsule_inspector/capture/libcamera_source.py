"""Câmeras CSI do Raspberry Pi via Picamera2 (libcamera).

Picamera2 é instalado pelo apt (`python3-picamera2`) e não pelo pip; o venv
precisa ser criado com `--system-site-packages` (ver docs/RASPBERRY_PI_SETUP.md).
"""

from __future__ import annotations

import time

import cv2
import numpy as np

from ..config import LibcameraConfig
from .base import CaptureError, FrameSource


class LibcameraSource(FrameSource):
    name = "libcamera"

    def __init__(self, cfg: LibcameraConfig):
        super().__init__()
        self.cfg = cfg
        self.cam = None

    def open(self) -> None:
        try:
            from picamera2 import Picamera2  # type: ignore[import-not-found]
        except ImportError as e:
            raise CaptureError("picamera2 indisponível: instale python3-picamera2 (apt) e use "
                               "venv com --system-site-packages") from e
        try:
            self.cam = Picamera2()
            conf = self.cam.create_still_configuration(
                main={"size": (self.cfg.width, self.cfg.height), "format": "RGB888"}, buffer_count=2)
            self.cam.configure(conf)
            controls: dict = {"AwbEnable": self.cfg.awb_enable}
            if self.cfg.exposure_us is not None:
                controls.update({"AeEnable": False, "ExposureTime": int(self.cfg.exposure_us)})
            if self.cfg.analogue_gain is not None:
                controls["AnalogueGain"] = float(self.cfg.analogue_gain)
            if not self.cfg.awb_enable and self.cfg.colour_gains:
                controls["ColourGains"] = tuple(self.cfg.colour_gains)
            self.cam.set_controls(controls)
            self.cam.start()
            time.sleep(self.cfg.warmup_s)
        except Exception as e:
            self.close()
            raise CaptureError(f"falha ao iniciar câmera libcamera: {e}") from e
        self.opened = True

    def _read(self) -> np.ndarray:
        try:
            arr = self.cam.capture_array("main")  # type: ignore[union-attr]
        except Exception as e:
            self.opened = False
            raise CaptureError(f"falha de captura libcamera: {e}") from e
        # "RGB888" no Picamera2 entrega bytes na ordem BGR (convenção do OpenCV)
        return arr if arr.ndim == 3 and arr.shape[2] == 3 else cv2.cvtColor(arr, cv2.COLOR_BGRA2BGR)

    def close(self) -> None:
        if self.cam is not None:
            try:
                self.cam.stop()
                self.cam.close()
            except Exception:
                pass
        self.cam = None
        self.opened = False
