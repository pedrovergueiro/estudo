# Benchmark

- Plataforma: **x86_64** — Ubuntu 24.04.5 LTS — Python 3.13.16 — 4 CPUs — RAM 16093 MB
- Medido em 2026-10-13T11:06:12
> **Estes números NÃO são de um Raspberry Pi.** Repita no hardware-alvo.

| Modelo | Backend | imgsz | Threads | Tam. (MB) | pré p50 | inf p50 | pós p50 | total p50 | total p95 | FPS | RSS pico (MB) | T máx (°C) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| best_320_fp32.onnx | onnxruntime | 320 | 1 | 10.542 | 1.0 | 27.5 | 0.7 | 29.3 | 42.6 | 31.435 | 206.0 | — |
| best_320_fp32.onnx | onnxruntime | 320 | 2 | 10.542 | 1.1 | 24.6 | 0.8 | 26.6 | 34.4 | 37.589 | 206.3 | — |
| best_320_fp32.onnx | onnxruntime | 320 | 4 | 10.542 | 1.0 | 20.5 | 0.8 | 22.4 | 30.3 | 43.707 | 206.5 | — |
