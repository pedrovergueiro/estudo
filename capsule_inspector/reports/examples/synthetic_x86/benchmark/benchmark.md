# Benchmark

- Plataforma: **x86_64** — Ubuntu 24.04.5 LTS — Python 3.13.16 — 4 CPUs — RAM 16093 MB
- Medido em 2026-10-13T11:00:06
> **Estes números NÃO são de um Raspberry Pi.** Repita no hardware-alvo.

| Modelo | Backend | imgsz | Threads | Tam. (MB) | pré p50 | inf p50 | pós p50 | total p50 | total p95 | FPS | RSS pico (MB) | T máx (°C) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| best.pt | ultralytics | 320 | 4 | 5.465 | 0.9 | 40.7 | 1.1 | 43.0 | 55.1 | 22.869 | 1080.1 | — |
| best_320_fp32.onnx | onnxruntime | 320 | 4 | 10.542 | 1.0 | 20.1 | 0.8 | 22.1 | 28.0 | 44.699 | 205.3 | — |
| best_320_fp32.onnx | opencv_dnn | 320 | 4 | 10.542 | 1.0 | 24.7 | 0.6 | 26.5 | 33.7 | 37.531 | 166.3 | — |
| best_320_int8.onnx | onnxruntime | 320 | 4 | 3.055 | 1.0 | 26.4 | 0.8 | 28.5 | 36.2 | 34.639 | 198.3 | — |
| best_416_fp32.onnx | onnxruntime | 416 | 4 | 10.571 | 2.0 | 29.6 | 0.8 | 32.6 | 41.9 | 30.169 | 221.1 | — |
| best_416_fp32.onnx | opencv_dnn | 416 | 4 | 10.571 | 1.9 | 38.6 | 0.8 | 41.5 | 51.9 | 23.995 | 178.1 | — |
| best_512_fp32.onnx | onnxruntime | 512 | 4 | 10.608 | 3.2 | 43.2 | 1.0 | 47.2 | 66.1 | 20.299 | 239.8 | — |
| best_512_fp32.onnx | opencv_dnn | 512 | 4 | 10.608 | 2.8 | 59.3 | 0.8 | 63.1 | 82.9 | 15.311 | 191.7 | — |
| best_640_fp32.onnx | onnxruntime | 640 | 4 | 10.668 | 4.8 | 61.1 | 1.0 | 67.1 | 87.1 | 14.641 | 272.8 | — |
| best_640_fp32.onnx | opencv_dnn | 640 | 4 | 10.668 | 4.5 | 87.9 | 0.9 | 93.1 | 114.1 | 10.631 | 212.0 | — |

## Precisão por configuração (mesmo split e avaliador)

| Configuração | mAP50 | mAP50-95 | Recall defeitos | Recall pequenos (média) | Escape | Falsa rejeição | REVIEW (defeituosas) | REVIEW (boas) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| best.pt / ultralytics / 320 | 0.935 | 0.642 | 0.907 | 0.927 | 0.023 | 0.000 | 0.227 | 0.000 |
| best_320_fp32.onnx / onnxruntime / 320 | 0.935 | 0.642 | 0.907 | 0.927 | 0.023 | 0.000 | 0.227 | 0.000 |
| best_320_fp32.onnx / opencv_dnn / 320 | 0.935 | 0.642 | 0.907 | 0.927 | 0.023 | 0.000 | 0.227 | 0.000 |
| best_320_int8.onnx / onnxruntime / 320 | 0.902 | 0.620 | 0.870 | 0.902 | 0.045 | 0.000 | 0.182 | 0.000 |
| best_416_fp32.onnx / onnxruntime / 416 | 0.911 | 0.618 | 0.889 | 0.902 | 0.000 | 0.000 | 0.341 | 0.000 |
| best_416_fp32.onnx / opencv_dnn / 416 | 0.911 | 0.618 | 0.889 | 0.902 | 0.000 | 0.000 | 0.341 | 0.000 |
| best_512_fp32.onnx / onnxruntime / 512 | 0.700 | 0.393 | 0.704 | 0.703 | 0.000 | 0.000 | 0.705 | 0.393 |
| best_512_fp32.onnx / opencv_dnn / 512 | 0.700 | 0.393 | 0.704 | 0.703 | 0.000 | 0.000 | 0.705 | 0.393 |
| best_640_fp32.onnx / onnxruntime / 640 | 0.353 | 0.182 | 0.556 | 0.615 | 0.000 | 0.000 | 0.864 | 0.714 |
| best_640_fp32.onnx / opencv_dnn / 640 | 0.353 | 0.182 | 0.556 | 0.615 | 0.000 | 0.000 | 0.864 | 0.714 |

Diferenças em relação à primeira linha (referência) indicam degradação por exportação/quantização.

## Configurações que falharam

- best_320_int8.onnx / opencv_dnn / imgsz 320: OpenCV DNN não executa este grafo: OpenCV(5.0.0) /io/opencv/modules/dnn/src/int8layers/pool2_int8_layer.cpp:334: error: (-215:Assertion failed) inptype == CV_8SC1 || inptype == CV_8UC1 in function 'forward'
