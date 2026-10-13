"""Câmera USB / industrial UVC via OpenCV (V4L2 no Linux)."""

from __future__ import annotations

import time

import cv2
import numpy as np

from ..config import UsbCameraConfig
from .base import CaptureError, FrameSource, log


class UsbCamera(FrameSource):
    name = "usb"

    def __init__(self, cfg: UsbCameraConfig):
        super().__init__()
        self.cfg = cfg
        self.cap: cv2.VideoCapture | None = None
        self.actual: dict[str, float] = {}

    def _apply(self) -> None:
        c, cap = self.cfg, self.cap
        assert cap is not None
        if c.fourcc:
            cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*c.fourcc))
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, c.width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, c.height)
        cap.set(cv2.CAP_PROP_FPS, c.fps)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        # V4L2: 1 = manual, 3 = aperture priority (auto)
        cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 3 if c.auto_exposure else 1)
        if not c.auto_exposure and c.exposure is not None:
            cap.set(cv2.CAP_PROP_EXPOSURE, float(c.exposure))
        cap.set(cv2.CAP_PROP_AUTOFOCUS, 1 if c.autofocus else 0)
        if not c.autofocus and c.focus is not None:
            cap.set(cv2.CAP_PROP_FOCUS, float(c.focus))
        cap.set(cv2.CAP_PROP_AUTO_WB, 1 if c.auto_white_balance else 0)
        if not c.auto_white_balance and c.white_balance_temperature is not None:
            cap.set(cv2.CAP_PROP_WB_TEMPERATURE, float(c.white_balance_temperature))
        self.actual = {
            "width": cap.get(cv2.CAP_PROP_FRAME_WIDTH), "height": cap.get(cv2.CAP_PROP_FRAME_HEIGHT),
            "fps": cap.get(cv2.CAP_PROP_FPS), "exposure": cap.get(cv2.CAP_PROP_EXPOSURE),
        }
        if (int(self.actual["width"]), int(self.actual["height"])) != (c.width, c.height):
            log.warning("câmera recusou a resolução pedida", extra={"extra_fields": {
                "requested": [c.width, c.height], "actual": self.actual}})

    def open(self) -> None:
        api = cv2.CAP_V4L2 if self.cfg.backend == "v4l2" else cv2.CAP_ANY
        last = None
        for attempt in range(1, self.cfg.reconnect_attempts + 1):
            self.cap = cv2.VideoCapture(self.cfg.device, api)
            if self.cap.isOpened():
                self._apply()
                for _ in range(self.cfg.warmup_frames):
                    self.cap.read()
                self.opened = True
                return
            last = f"tentativa {attempt}: dispositivo {self.cfg.device} não abriu"
            self.cap.release()
            time.sleep(self.cfg.reconnect_backoff_s * attempt)
        raise CaptureError(f"câmera USB indisponível ({last})")

    def _read(self) -> np.ndarray:
        assert self.cap is not None
        deadline = time.monotonic() + self.cfg.read_timeout_s
        for _ in range(self.cfg.flush_frames):  # descarta quadros antigos do buffer
            self.cap.grab()
        while time.monotonic() < deadline:
            ok, img = self.cap.read()
            if ok and img is not None and img.size:
                return img
        self.opened = False
        raise CaptureError("timeout/erro de leitura da câmera USB (desconectada?)")

    def reconnect(self) -> None:
        self.close()
        self.open()

    def close(self) -> None:
        if self.cap is not None:
            self.cap.release()
        self.cap = None
        self.opened = False

    def describe(self) -> dict:
        return {**super().describe(), "device": str(self.cfg.device), "actual": self.actual}
