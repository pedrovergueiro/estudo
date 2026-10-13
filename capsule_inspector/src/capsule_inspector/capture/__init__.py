"""Fontes de imagem: câmera USB, libcamera (CSI) e arquivos."""

from __future__ import annotations

from ..config import CameraConfig, Settings
from .base import (
    CaptureError,
    CorruptFrame,
    EndOfStream,
    FrameSource,
    LightingController,
    NullLightingController,
    capture_views,
)


def create_source(cfg: CameraConfig, settings: Settings | None = None) -> FrameSource:
    if cfg.type == "auto":
        from .discover import choose_source
        kind, dev = choose_source()
        if kind == "none":
            raise CaptureError("nenhuma câmera encontrada (USB UVC ou CSI). Rode `capsule-inspector diagnostico`")
        cfg = cfg.model_copy(deep=True)
        cfg.type = kind  # type: ignore[assignment]
        if dev:
            cfg.usb.device = dev
    if cfg.type == "csi":
        from .rpicam_source import RpicamSource
        return RpicamSource(cfg.csi.width, cfg.csi.height, cfg.csi.fps, cfg.csi.extra_args)
    if cfg.type == "usb":
        from .usb_camera import UsbCamera
        return UsbCamera(cfg.usb)
    if cfg.type == "libcamera":
        from .libcamera_source import LibcameraSource
        return LibcameraSource(cfg.libcamera)
    from .file_source import FileSource
    path = settings.path(cfg.file.path) if settings else cfg.file.path
    return FileSource(path, cfg.file.pattern, cfg.file.loop)


class LazySource(FrameSource):
    """Cria a fonte real só no `open()`: câmera ausente na inicialização não derruba o serviço;
    cada nova tentativa redescobre a câmera (útil com type: auto e câmeras reconectadas)."""

    name = "lazy"

    def __init__(self, cfg: CameraConfig, settings: Settings | None = None):
        super().__init__()
        self.cfg, self.settings = cfg, settings
        self.inner: FrameSource | None = None

    def open(self) -> None:
        self.close()
        self.inner = create_source(self.cfg, self.settings)
        self.name = self.inner.name
        self.inner.open()
        self.opened = True

    def _read(self):  # type: ignore[no-untyped-def]
        raise NotImplementedError

    def read(self, view: str = "default"):  # type: ignore[no-untyped-def]
        if self.inner is None:
            raise CaptureError("câmera não aberta")
        try:
            return self.inner.read(view)
        except (CorruptFrame, EndOfStream):
            raise  # fonte continua aberta (próximo arquivo) / fim normal
        except CaptureError:
            self.opened = False
            raise

    def close(self) -> None:
        if self.inner is not None:
            self.inner.close()
        self.opened = False

    def describe(self) -> dict:
        d = self.inner.describe() if self.inner is not None else {}
        return {"configured_type": self.cfg.type, **d, "opened": self.opened}


__all__ = ["LazySource", "CaptureError", "CorruptFrame", "EndOfStream", "FrameSource", "LightingController",
           "NullLightingController", "capture_views", "create_source"]
