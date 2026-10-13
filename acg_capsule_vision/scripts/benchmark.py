#!/usr/bin/env python3
"""Benchmark do MESMO modelo no equipamento onde é executado (ex.: o Raspberry Pi, quando
o modelo exato for identificado). Usa apenas PyTorch/Ultralytics em CPU: ONNX, TFLite,
Hailo ou outros aceleradores NÃO são usados até a compatibilidade ser verificada.

  python scripts/benchmark.py --weights models/final/detect_yolo11n.pt --images data/prepared/medical_pills/images/test
  python scripts/benchmark.py --weights ... --images ... --duration 600      # estabilidade (10 min)
  python scripts/benchmark.py --weights ... --images ... --threads 2

Mede: latência por imagem (p50/p95/p99/máx), throughput, RSS do processo (pico),
deriva de latência (último décimo vs primeiro), erros, temperatura/frequência da CPU
quando o sistema expõe (/sys). Números de outra máquina NÃO valem para esta.
"""

import argparse
import json
import os
import platform
import time
from pathlib import Path

import _bootstrap  # noqa: F401
import numpy as np

from acg_vision.config import resolve
from acg_vision.inference.predictor import Predictor, iter_images
from acg_vision.training.common import environment


def rss_mb() -> float:
    try:
        for line in open(f"/proc/{os.getpid()}/status"):
            if line.startswith("VmHWM:"):  # pico de RSS
                return int(line.split()[1]) / 1024
    except OSError:
        pass
    return float("nan")


def sensor(path: str, scale: float) -> float | None:
    try:
        return int(Path(path).read_text().strip()) / scale
    except (OSError, ValueError):
        return None


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--weights", required=True, type=Path)
    ap.add_argument("--images", required=True, type=Path)
    ap.add_argument("--iterations", type=int, default=100)
    ap.add_argument("--duration", type=float, default=0.0)
    ap.add_argument("--warmup", type=int, default=5)
    ap.add_argument("--threads", type=int)
    ap.add_argument("--imgsz", type=int)
    ap.add_argument("--out", type=Path, default=Path("reports/benchmark"))
    a = ap.parse_args()
    if a.threads:
        import torch
        torch.set_num_threads(a.threads)
    import cv2
    files = iter_images([resolve(a.images)])[:50]
    imgs = [cv2.imread(str(f)) for f in files]
    rss0 = rss_mb()
    t0 = time.perf_counter()
    pred = Predictor(resolve(a.weights), a.imgsz)
    load_s = time.perf_counter() - t0
    for i in range(a.warmup):
        pred.predict(imgs[i % len(imgs)])
    lat, errors, temps, freqs = [], 0, [], []
    start = time.perf_counter()
    n = 0
    while True:
        t = time.perf_counter()
        try:
            r = pred.predict(imgs[n % len(imgs)])
            errors += r.get("status") != "OK"
        except Exception:  # noqa: BLE001 — conta e segue (teste de estabilidade)
            errors += 1
        lat.append((time.perf_counter() - t) * 1000)
        n += 1
        if n % 20 == 0:
            temps.append(sensor("/sys/class/thermal/thermal_zone0/temp", 1000))
            freqs.append(sensor("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq", 1000))
        el = time.perf_counter() - start
        if (a.duration and el >= a.duration) or (not a.duration and n >= a.iterations):
            break
    L = np.array(lat)
    k = max(1, len(L) // 10)
    model_txt = Path("/proc/device-tree/model")
    rep = {
        "device": model_txt.read_text().strip("\x00\n") if model_txt.exists() else platform.machine(),
        "environment": environment(), "model": pred.model_info, "imgsz": pred.imgsz,
        "threads": a.threads or "padrão do PyTorch", "images": len(imgs),
        "image_size": list(imgs[0].shape[1::-1]), "iterations": n, "wall_seconds": round(el, 2),
        "load_seconds": round(load_s, 2),
        "latency_ms": {"p50": float(np.percentile(L, 50)), "p95": float(np.percentile(L, 95)),
                       "p99": float(np.percentile(L, 99)), "max": float(L.max()), "mean": float(L.mean())},
        "throughput_img_per_s": round(n / el, 3),
        "latency_drift_last_vs_first_decile": round(float(L[-k:].mean() / L[:k].mean()), 3),
        "errors": errors, "rss_peak_mb": round(rss_mb(), 1), "rss_before_load_mb": round(rss0, 1),
        "cpu_temp_c": {"first": temps[0] if temps else None, "max": max([t for t in temps if t] or [0]) or None},
        "cpu_freq_mhz": {"min": min([f for f in freqs if f] or [0]) or None},
        "accelerators_used": "nenhum (CPU, PyTorch)",
    }
    out = resolve(a.out)
    out.mkdir(parents=True, exist_ok=True)
    name = f"benchmark_{Path(a.weights).stem}_{int(time.time())}.json"
    (out / name).write_text(json.dumps(rep, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({k: rep[k] for k in ("device", "latency_ms", "throughput_img_per_s", "rss_peak_mb",
                                          "errors", "latency_drift_last_vs_first_decile")}, indent=2))
    print("relatório:", out / name)


if __name__ == "__main__":
    main()
