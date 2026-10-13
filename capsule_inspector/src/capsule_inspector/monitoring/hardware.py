"""Detecção de plataforma, sensores e recomendação de backend.

Lê apenas fontes locais (/proc, /sys, vcgencmd). Nada aqui requer internet.
"""

from __future__ import annotations

import importlib.metadata
import os
import platform
import shutil
import subprocess
from pathlib import Path
from typing import Any

LIBS = ["numpy", "opencv-python-headless", "opencv-python", "onnxruntime", "onnx",
        "ultralytics", "torch", "torchvision", "fastapi", "uvicorn", "pydantic", "PyYAML",
        "psutil", "picamera2", "gpiozero"]


def _read(path: str) -> str | None:
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace").strip("\x00\n ")
    except OSError:
        return None


def library_versions() -> dict[str, str]:
    out: dict[str, str] = {}
    for name in LIBS:
        try:
            out[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            continue
    try:  # OpenCV pode vir do apt (python3-opencv) sem metadata pip
        import cv2
        out.setdefault("cv2", cv2.__version__)
    except Exception:
        pass
    return out


def os_release() -> dict[str, str]:
    data: dict[str, str] = {}
    txt = _read("/etc/os-release")
    if txt:
        for line in txt.splitlines():
            if "=" in line:
                k, v = line.split("=", 1)
                data[k] = v.strip('"')
    return data


def memory_info() -> dict[str, float]:
    info: dict[str, float] = {}
    txt = _read("/proc/meminfo")
    if txt:
        for line in txt.splitlines():
            parts = line.split()
            if len(parts) >= 2 and parts[0] in ("MemTotal:", "MemAvailable:"):
                info[parts[0].rstrip(":")] = int(parts[1]) / 1024.0  # MiB
    return {"total_mb": info.get("MemTotal", 0.0), "available_mb": info.get("MemAvailable", 0.0)}


def raspberry_pi_model() -> str | None:
    model = _read("/proc/device-tree/model")
    if model and "raspberry pi" in model.lower():
        return model
    return None


def cpu_temperature_c() -> float | None:
    for zone in sorted(Path("/sys/class/thermal").glob("thermal_zone*")):
        t = _read(str(zone / "temp"))
        typ = (_read(str(zone / "type")) or "").lower()
        if t and t.lstrip("-").isdigit() and ("cpu" in typ or "soc" in typ or zone.name == "thermal_zone0"):
            return int(t) / 1000.0
    return None


def cpu_frequency_mhz() -> float | None:
    v = _read("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq")
    return int(v) / 1000.0 if v and v.isdigit() else None


def throttled_flags() -> dict[str, Any] | None:
    """Decodifica `vcgencmd get_throttled` (somente Raspberry Pi)."""
    exe = shutil.which("vcgencmd")
    if not exe:
        return None
    try:
        out = subprocess.run([exe, "get_throttled"], capture_output=True, text=True, timeout=2).stdout
        value = int(out.strip().split("=")[1], 16)
    except Exception:
        return None
    bits = {0: "under_voltage_now", 1: "freq_capped_now", 2: "throttled_now",
            3: "soft_temp_limit_now", 16: "under_voltage_occurred", 17: "freq_capped_occurred",
            18: "throttled_occurred", 19: "soft_temp_limit_occurred"}
    return {"raw": hex(value), **{name: bool(value & (1 << b)) for b, name in bits.items()}}


def accelerators() -> dict[str, bool]:
    """Presença de aceleradores conhecidos. Presença != runtime compatível."""
    return {
        "hailo_device": Path("/dev/hailo0").exists(),
        "coral_pcie": Path("/dev/apex_0").exists(),
        "nvidia_gpu": Path("/dev/nvidia0").exists(),
    }


def onnxruntime_providers() -> list[str]:
    try:
        import onnxruntime as ort
        return list(ort.get_available_providers())
    except Exception:
        return []


def platform_report() -> dict[str, Any]:
    osr = os_release()
    return {
        "machine": platform.machine(),
        "system": platform.system(),
        "kernel": platform.release(),
        "os": osr.get("PRETTY_NAME", platform.platform()),
        "python": platform.python_version(),
        "cpu_count": os.cpu_count(),
        "raspberry_pi_model": raspberry_pi_model(),
        "memory": memory_info(),
        "cpu_temperature_c": cpu_temperature_c(),
        "cpu_frequency_mhz": cpu_frequency_mhz(),
        "throttled": throttled_flags(),
        "accelerators": accelerators(),
        "onnxruntime_providers": onnxruntime_providers(),
        "libraries": library_versions(),
    }


def recommend_backend(model_path: str | Path, report: dict[str, Any] | None = None) -> str:
    """Escolhe o backend para `backend: auto`.

    A regra é conservadora: ONNX Runtime CPU é o padrão para .onnx (sem PyTorch no
    dispositivo, menor uso de RAM). A escolha final deve ser confirmada com
    scripts/benchmark_model.py no hardware real.
    """
    p = str(model_path)
    if p.endswith(".onnx"):
        return "onnxruntime"
    if p.endswith(".pt") or p.endswith("_ncnn_model") or p.endswith("_openvino_model"):
        return "ultralytics"
    raise ValueError(f"formato de modelo não reconhecido: {p}")
