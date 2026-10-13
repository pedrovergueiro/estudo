"""Benchmark de modelos/backends/resoluções no hardware em que é executado.

Mede por configuração: latência por estágio (pré-processamento, inferência,
pós-processamento), latência total, FPS sustentado, RSS, tamanho do modelo,
temperatura/frequência da CPU ao longo do teste e flags de throttling.
Opcionalmente avalia a precisão (mesmo split, mesmo avaliador) para mostrar
se exportação/quantização degradou defeitos pequenos.

Nenhum número é inventado: o relatório registra a plataforma onde foi medido.
"""

from __future__ import annotations

import gc
import json
import time
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..inference.backends import create_backend
from . import hardware
from .performance import process_rss_mb, summarize


def _size_mb(p: Path) -> float:
    p = Path(p)
    if p.is_dir():
        return sum(f.stat().st_size for f in p.rglob("*") if f.is_file()) / 1e6
    return p.stat().st_size / 1e6


def load_images(paths: list[Path], limit: int = 50) -> list[np.ndarray]:
    out = []
    for p in paths[:limit]:
        img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img is not None:
            out.append(img)
    if not out:
        raise RuntimeError("nenhuma imagem de benchmark legível")
    return out


def bench_config(model_path: Path, backend: str, imgsz: int, names: list[str], images: list[np.ndarray],
                 warmup: int = 5, iterations: int = 100, duration_s: float = 0.0, num_threads: int = 4,
                 conf: float = 0.05, iou: float = 0.5, sample_every_s: float = 2.0) -> dict[str, Any]:
    gc.collect()
    rss0 = process_rss_mb()
    t_load = time.perf_counter()
    be = create_backend(backend, model_path, imgsz=imgsz, names=names, conf=conf, iou=iou, max_det=100,
                        num_threads=num_threads)
    load_ms = (time.perf_counter() - t_load) * 1000
    rss_loaded = process_rss_mb()
    for i in range(warmup):
        be.predict(images[i % len(images)])
    stages: dict[str, list[float]] = {"preprocess": [], "inference": [], "postprocess": [], "total": []}
    thermal: list[dict[str, Any]] = []
    rss_peak = rss_loaded
    t_start = time.perf_counter()
    last_sample = 0.0
    n = 0
    while True:
        img = images[n % len(images)]
        t0 = time.perf_counter()
        _, t = be.predict(img)
        stages["total"].append((time.perf_counter() - t0) * 1000)
        for k in ("preprocess", "inference", "postprocess"):
            stages[k].append(t.get(k, 0.0))
        n += 1
        el = time.perf_counter() - t_start
        if el - last_sample >= sample_every_s:
            last_sample = el
            rss_peak = max(rss_peak, process_rss_mb())
            thermal.append({"t_s": round(el, 1), "temp_c": hardware.cpu_temperature_c(),
                            "freq_mhz": hardware.cpu_frequency_mhz()})
        if duration_s > 0:
            if el >= duration_s:
                break
        elif n >= iterations:
            break
    wall = time.perf_counter() - t_start
    thr = hardware.throttled_flags()
    temps = [x["temp_c"] for x in thermal if x["temp_c"] is not None]
    return {
        "model": str(model_path), "backend": be.name, "imgsz": imgsz, "threads": num_threads,
        "model_size_mb": round(_size_mb(model_path), 3), "load_ms": round(load_ms, 1),
        "iterations": n, "wall_s": round(wall, 2), "fps_sustained": round(n / wall, 3) if wall else None,
        "latency_ms": {k: summarize(v) for k, v in stages.items()},
        "rss_mb": {"before_load": round(rss0, 1), "after_load": round(rss_loaded, 1), "peak": round(rss_peak, 1)},
        "thermal_samples": thermal,
        "temp_c": {"start": temps[0] if temps else None, "end": temps[-1] if temps else None,
                   "max": max(temps) if temps else None},
        "throttled_at_end": thr,
    }


def write_benchmark(results: list[dict[str, Any]], out_dir: Path, accuracy: dict[str, Any] | None = None,
                    failures: list[dict[str, Any]] | None = None, data: dict[str, Any] | None = None) -> Path:
    """Grava benchmark.json + benchmark.md. Com `data` (JSON já medido) apenas regenera o Markdown."""
    out_dir.mkdir(parents=True, exist_ok=True)
    if data is None:
        data = {"platform": hardware.platform_report(), "measured_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "results": results, "accuracy": accuracy, "failures": failures or []}
        jp = out_dir / "benchmark.json"
        jp.write_text(json.dumps(data, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    results, accuracy, failures = data["results"], data.get("accuracy"), data.get("failures")
    plat = data["platform"]
    L = ["# Benchmark", "",
         f"- Plataforma: **{plat.get('raspberry_pi_model') or plat['machine']}** — {plat['os']} — "
         f"Python {plat['python']} — {plat['cpu_count']} CPUs — RAM {plat['memory']['total_mb']:.0f} MB",
         f"- Medido em {data['measured_at']}",
         "" if plat.get("raspberry_pi_model") else
         "> **Estes números NÃO são de um Raspberry Pi.** Repita no hardware-alvo.", "",
         "| Modelo | Backend | imgsz | Threads | Tam. (MB) | pré p50 | inf p50 | pós p50 | total p50 | total p95 | FPS | RSS pico (MB) | T máx (°C) |",
         "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
    for r in results:
        lt = r["latency_ms"]
        L.append(f"| {Path(r['model']).name} | {r['backend']} | {r['imgsz']} | {r['threads']} | {r['model_size_mb']} | "
                 f"{lt['preprocess']['p50']:.1f} | {lt['inference']['p50']:.1f} | {lt['postprocess']['p50']:.1f} | "
                 f"{lt['total']['p50']:.1f} | {lt['total']['p95']:.1f} | {r['fps_sustained']} | "
                 f"{r['rss_mb']['peak']} | {r['temp_c']['max'] if r['temp_c']['max'] is not None else '—'} |")
    if accuracy:
        L += ["", "## Precisão por configuração (mesmo split e avaliador)", "",
              "| Configuração | mAP50 | mAP50-95 | Recall defeitos | Recall pequenos (média) | Escape | "
              "Falsa rejeição | REVIEW (defeituosas) | REVIEW (boas) |",
              "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]

        def f(x: Any) -> str:
            return "—" if x is None else f"{x:.3f}"
        for k, a in accuracy.items():
            L.append(f"| {k.replace('|', ' / ')} | {f(a.get('map50'))} | {f(a.get('map50_95'))} | "
                     f"{f(a.get('defects_recall'))} | {f(a.get('small_recall_mean'))} | {f(a.get('escape_rate'))} | "
                     f"{f(a.get('false_reject_rate'))} | {f(a.get('review_rate_defective'))} | "
                     f"{f(a.get('review_rate_good'))} |")
        L += ["", "Diferenças em relação à primeira linha (referência) indicam degradação por exportação/quantização."]
    if failures:
        L += ["", "## Configurações que falharam", ""]
        L += [f"- {Path(f['model']).name} / {f['backend']} / imgsz {f['imgsz']}: {f['error']}" for f in failures]
    mp = out_dir / "benchmark.md"
    mp.write_text("\n".join(L) + "\n", encoding="utf-8")
    return mp
