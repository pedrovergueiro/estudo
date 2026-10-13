"""Câmera CSI do Raspberry Pi via `rpicam-vid` (ou `libcamera-vid`, nome antigo).

Lê um fluxo MJPEG pela saída padrão do programa do sistema. Assim não é preciso
importar Picamera2 no Python do aplicativo — evita o conflito binário entre o numpy
do sistema (usado pelo Picamera2 do apt) e o numpy empacotado com o aplicativo.
"""

from __future__ import annotations

import shutil
import subprocess
import threading
import time

import cv2
import numpy as np

from .base import CaptureError, FrameSource

SOI, EOI = b"\xff\xd8", b"\xff\xd9"


def find_rpicam() -> str | None:
    for exe in ("rpicam-vid", "libcamera-vid"):
        p = shutil.which(exe)
        if p:
            return p
    return None


class MjpegStreamParser:
    """Separa quadros JPEG de um fluxo MJPEG bruto (concatenação de JPEGs)."""

    def __init__(self) -> None:
        self.buf = bytearray()

    def feed(self, data: bytes) -> list[bytes]:
        self.buf += data
        frames = []
        while True:
            s = self.buf.find(SOI)
            if s < 0:
                self.buf.clear()
                break
            e = self.buf.find(EOI, s + 2)
            if e < 0:
                if s > 0:
                    del self.buf[:s]
                break
            frames.append(bytes(self.buf[s:e + 2]))
            del self.buf[:e + 2]
        return frames


class RpicamSource(FrameSource):
    name = "csi"

    def __init__(self, width: int = 1920, height: int = 1080, fps: int = 15, extra_args: list[str] | None = None,
                 executable: str | None = None, read_timeout_s: float = 3.0):
        super().__init__()
        self.width, self.height, self.fps = width, height, fps
        self.extra = extra_args or []
        self.exe = executable
        self.timeout = read_timeout_s
        self.proc: subprocess.Popen | None = None
        self._latest: bytes | None = None
        self._seq = 0
        self._lock = threading.Condition()
        self._reader: threading.Thread | None = None
        self._err = ""

    def open(self) -> None:
        exe = self.exe or find_rpicam()
        if not exe:
            raise CaptureError("rpicam-vid/libcamera-vid não encontrado (câmera CSI exige Raspberry Pi OS "
                               "com rpicam-apps; para câmera USB use --fonte usb)")
        cmd = [exe, "-t", "0", "-n", "--codec", "mjpeg", "--width", str(self.width), "--height", str(self.height),
               "--framerate", str(self.fps), "-o", "-", *self.extra]
        try:
            self.proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)
        except OSError as e:
            raise CaptureError(f"falha ao iniciar {exe}: {e}") from e
        self._reader = threading.Thread(target=self._pump, daemon=True)
        self._reader.start()
        threading.Thread(target=self._drain_err, daemon=True).start()
        self.opened = True
        try:
            self._wait_frame(self._seq, max(self.timeout, 5.0))  # 1º quadro (câmera inicializa)
        except CaptureError:
            self.close()
            raise

    def _pump(self) -> None:
        parser = MjpegStreamParser()
        assert self.proc and self.proc.stdout
        while True:
            chunk = self.proc.stdout.read(65536)
            if not chunk:
                break
            for f in parser.feed(chunk):
                with self._lock:
                    self._latest = f
                    self._seq += 1
                    self._lock.notify_all()
        with self._lock:
            self._lock.notify_all()

    def _drain_err(self) -> None:
        assert self.proc and self.proc.stderr
        for line in self.proc.stderr:
            self._err = (self._err + line.decode(errors="replace"))[-2000:]

    def _wait_frame(self, after: int, timeout: float) -> bytes:
        deadline = time.monotonic() + timeout
        with self._lock:
            while self._seq <= after:
                left = deadline - time.monotonic()
                if left <= 0 or (self.proc and self.proc.poll() is not None and self._seq <= after):
                    msg = self._err.strip().splitlines()[-1] if self._err.strip() else "sem quadros"
                    raise CaptureError(f"câmera CSI não entregou quadro: {msg}")
                self._lock.wait(min(left, 0.2))
            assert self._latest is not None
            return self._latest

    def _read(self) -> np.ndarray:
        data = self._wait_frame(self._seq, self.timeout)  # sempre um quadro NOVO
        img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            raise CaptureError("quadro JPEG inválido da câmera CSI")
        return img

    def close(self) -> None:
        if self.proc and self.proc.poll() is None:
            self.proc.terminate()
            try:
                self.proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                self.proc.kill()
        self.proc = None
        self.opened = False

    def describe(self) -> dict:
        return {**super().describe(), "executable": self.exe or find_rpicam(), "size": [self.width, self.height]}
