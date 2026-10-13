"""Fontes de imagem: câmera USB, libcamera (CSI) e arquivos."""

from __future__ import annotations

from ..config import CameraConfig, Settings
from .base import CaptureError, EndOfStream, FrameSource, LightingController, NullLightingController, capture_views


def create_source(cfg: CameraConfig, settings: Settings | None = None) -> FrameSource:
    if cfg.type == "usb":
        from .usb_camera import UsbCamera
        return UsbCamera(cfg.usb)
    if cfg.type == "libcamera":
        from .libcamera_source import LibcameraSource
        return LibcameraSource(cfg.libcamera)
    from .file_source import FileSource
    path = settings.path(cfg.file.path) if settings else cfg.file.path
    return FileSource(path, cfg.file.pattern, cfg.file.loop)


__all__ = ["CaptureError", "EndOfStream", "FrameSource", "LightingController",
           "NullLightingController", "capture_views", "create_source"]
