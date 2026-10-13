"""Utilitários comuns: ambiente, sementes, manifesto de execução."""

from __future__ import annotations

import importlib.metadata
import json
import os
import platform
import random
import time
from pathlib import Path
from typing import Any

import numpy as np

from ..data.fetch import sha256_file


def set_seeds(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import torch
        torch.manual_seed(seed)
    except ImportError:
        pass


def environment() -> dict[str, Any]:
    libs = {}
    for n in ("ultralytics", "torch", "torchvision", "numpy", "opencv-python", "opencv-python-headless", "PyYAML"):
        try:
            libs[n] = importlib.metadata.version(n)
        except importlib.metadata.PackageNotFoundError:
            pass
    mem = None
    try:
        for line in open("/proc/meminfo"):
            if line.startswith("MemTotal:"):
                mem = round(int(line.split()[1]) / 1024)
    except OSError:
        pass
    cpu = platform.processor() or ""
    try:
        for line in open("/proc/cpuinfo"):
            if line.startswith("model name"):
                cpu = line.split(":", 1)[1].strip()
                break
    except OSError:
        pass
    gpu = None
    try:
        import torch
        gpu = torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    except Exception:
        pass
    return {"python": platform.python_version(), "os": platform.platform(), "machine": platform.machine(),
            "cpu": cpu, "cpu_count": os.cpu_count(), "ram_mb": mem, "gpu": gpu, "libraries": libs}


def weights_info(path: Path) -> dict[str, Any]:
    return {"file": Path(path).name, "sha256": sha256_file(Path(path)), "bytes": Path(path).stat().st_size}


def model_summary(model) -> dict[str, Any]:  # type: ignore[no-untyped-def]
    m = model.model
    n_params = sum(p.numel() for p in m.parameters())
    yaml_cfg = getattr(m, "yaml", {}) or {}
    return {"task": model.task, "n_params": int(n_params), "n_classes": len(model.names),
            "names_sample": [model.names[k] for k in sorted(model.names)][:10],
            "architecture_yaml": yaml_cfg.get("yaml_file"), "scale": yaml_cfg.get("scale")}


class Timer:
    def __enter__(self) -> Timer:
        self.t0 = time.perf_counter()
        return self

    def __exit__(self, *a: object) -> None:
        self.seconds = time.perf_counter() - self.t0


def write_json(path: Path, obj: Any) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    return path
