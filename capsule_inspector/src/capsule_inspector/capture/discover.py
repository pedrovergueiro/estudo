"""Descoberta de câmeras sem bibliotecas extras (Linux /sys + rpicam-hello)."""

from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path


def usb_cameras(sysfs: Path = Path("/sys/class/video4linux")) -> list[dict[str, str]]:
    """Câmeras UVC (USB). No Pi 5 há vários /dev/video* do ISP/codec que NÃO são câmeras:
    só nós com driver `uvcvideo` e índice 0 (nó de captura) contam."""
    out = []
    if not sysfs.exists():
        return out
    for node in sorted(sysfs.glob("video*"), key=lambda p: int(re.sub(r"\D", "", p.name) or 0)):
        try:
            driver = Path(node / "device" / "driver").resolve().name
        except OSError:
            continue
        idx = (node / "index").read_text().strip() if (node / "index").exists() else "0"
        if driver == "uvcvideo" and idx == "0":
            name = (node / "name").read_text().strip() if (node / "name").exists() else node.name
            out.append({"device": f"/dev/{node.name}", "name": name})
    return out


def csi_cameras(timeout: float = 8.0) -> list[dict[str, str]]:
    exe = shutil.which("rpicam-hello") or shutil.which("libcamera-hello")
    if not exe:
        return []
    try:
        txt = subprocess.run([exe, "--list-cameras"], capture_output=True, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired):
        return []
    return parse_list_cameras(txt.stdout + txt.stderr)


def parse_list_cameras(text: str) -> list[dict[str, str]]:
    cams = []
    for m in re.finditer(r"^\s*(\d+)\s*:\s*(\S+)\s*\[([^\]]*)\]", text, re.M):
        cams.append({"index": m.group(1), "sensor": m.group(2), "mode": m.group(3)})
    return cams


def choose_source() -> tuple[str, str | None]:
    """('usb', '/dev/videoN') | ('csi', None) | ('none', None)."""
    usb = usb_cameras()
    if usb:
        return "usb", usb[0]["device"]
    if csi_cameras():
        return "csi", None
    return "none", None
