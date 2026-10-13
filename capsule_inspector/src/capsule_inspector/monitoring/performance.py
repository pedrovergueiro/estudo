"""Medição de tempos por estágio e estatísticas de desempenho."""

from __future__ import annotations

import os
import time
from collections import deque
from collections.abc import Iterator
from contextlib import contextmanager

import numpy as np


class StageTimer:
    """Acumula tempos (ms) por estágio para uma única inspeção."""

    def __init__(self) -> None:
        self.stages: dict[str, float] = {}
        self._t0 = time.perf_counter()

    @contextmanager
    def stage(self, name: str) -> Iterator[None]:
        t = time.perf_counter()
        try:
            yield
        finally:
            self.stages[name] = self.stages.get(name, 0.0) + (time.perf_counter() - t) * 1000.0

    def add(self, name: str, ms: float) -> None:
        self.stages[name] = self.stages.get(name, 0.0) + ms

    def total_ms(self) -> float:
        return (time.perf_counter() - self._t0) * 1000.0

    def as_dict(self) -> dict[str, float]:
        d = {k: round(v, 3) for k, v in self.stages.items()}
        d["total"] = round(self.total_ms(), 3)
        return d


def summarize(values: list[float] | np.ndarray) -> dict[str, float]:
    a = np.asarray(values, dtype=np.float64)
    if a.size == 0:
        return {"n": 0}
    return {
        "n": int(a.size),
        "mean": float(a.mean()),
        "std": float(a.std()),
        "min": float(a.min()),
        "p50": float(np.percentile(a, 50)),
        "p95": float(np.percentile(a, 95)),
        "p99": float(np.percentile(a, 99)),
        "max": float(a.max()),
    }


class RollingStats:
    """Janela deslizante para monitorar latência e FPS em operação contínua."""

    def __init__(self, window: int = 200) -> None:
        self.latencies: deque[float] = deque(maxlen=window)
        self.stamps: deque[float] = deque(maxlen=window)
        self.count = 0
        self.errors = 0

    def add(self, latency_ms: float, ok: bool = True) -> None:
        self.latencies.append(latency_ms)
        self.stamps.append(time.monotonic())
        self.count += 1
        if not ok:
            self.errors += 1

    def fps(self) -> float:
        if len(self.stamps) < 2:
            return 0.0
        dt = self.stamps[-1] - self.stamps[0]
        return (len(self.stamps) - 1) / dt if dt > 0 else 0.0

    def snapshot(self) -> dict[str, float]:
        s = summarize(list(self.latencies))
        return {"count": self.count, "errors": self.errors, "fps": round(self.fps(), 3),
                "latency_p50_ms": round(s.get("p50", 0.0), 3),
                "latency_p95_ms": round(s.get("p95", 0.0), 3)}


def process_rss_mb() -> float:
    try:
        import psutil
        return psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024)
    except Exception:
        try:
            with open(f"/proc/{os.getpid()}/status", encoding="utf-8") as fh:
                for line in fh:
                    if line.startswith("VmRSS:"):
                        return int(line.split()[1]) / 1024.0
        except OSError:
            pass
    return float("nan")
