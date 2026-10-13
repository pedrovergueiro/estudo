# Benchmarks

## Como medir no Raspberry Pi

```bash
# exporte as resoluções candidatas na estação
python scripts/export_model.py --weights best.pt --imgsz 320 416 512 640 --int8
# no Pi: latência + RAM + temperatura, um processo por configuração
.venv/bin/python scripts/benchmark_model.py --models models/export/best_*_fp32.onnx models/export/best_640_int8.onnx \
    --backends auto opencv_dnn --threads 2 4 --iterations 300 --eval-split test
# estabilidade térmica: 30–60 min contínuos
.venv/bin/python scripts/benchmark_model.py --models models/export/best_640_fp32.onnx --duration 3600
# latência captura→resultado real (câmera configurada): o serviço registra os tempos por estágio
.venv/bin/python scripts/run_inspection.py --max 500 --continuous
```

Cada configuração é medida em um **processo novo** (RSS não herda bibliotecas de outra
configuração). Registrados: tempos de pré-processamento, inferência e pós-processamento (p50,
p95, p99), total, FPS sustentado, RSS antes/depois da carga e pico, tamanho do modelo,
amostras de temperatura e frequência da CPU a cada 2 s e `vcgencmd get_throttled` ao final.
O registro de cada inspeção do serviço separa `capture`, `quality`, `preprocess`,
`model_preprocess`, `model_inference`, `model_postprocess`, `roi`, `anomaly`, `decision`,
`annotate`, `persist` e `total`.

Meta inicial (a comprovar no Pi): ≤ 100 ms por imagem em configuração de baixa resolução. Se não
for atingida, as alternativas mensuráveis são: menor `imgsz` **com** verificação do recall de
defeitos pequenos, recorte em 2 estágios, NCNN, INT8 (se aprovado na regressão), threads, ou
acelerador externo compatível.

## Resultados medidos até agora — NÃO são de Raspberry Pi

**Ambiente**: contêiner x86_64, 4 vCPUs (compartilhadas), 16 GB RAM, Ubuntu 24.04, Python 3.13.16,
onnxruntime 1.31.0, OpenCV 5.0.0, PyTorch 2.14.1 CPU, Ultralytics 8.4.176. Sem sensores térmicos
(temperatura “—”). **Modelo**: YOLO11n treinado 30 épocas em 320 px com o dataset **sintético**
(240 unidades, 480 imagens; teste = 36 unidades / 72 imagens). Artefatos completos em
`reports/examples/synthetic_x86/`.

### Latência e memória (200 iterações, 4 threads)

| Modelo | Backend | imgsz | inferência p50 (ms) | total p50 / p95 (ms) | FPS | RSS pico (MB) | Tamanho (MB) |
|---|---|---:|---:|---:|---:|---:|---:|
| best.pt | Ultralytics (PyTorch) | 320 | 40.7 | 43.0 / 55.1 | 22.9 | 1080 | 5.5 |
| FP32 ONNX | ONNX Runtime | 320 | 20.1 | 22.1 / 28.0 | 44.7 | 205 | 10.5 |
| FP32 ONNX | OpenCV DNN | 320 | 24.7 | 26.5 / 33.7 | 37.5 | 166 | 10.5 |
| INT8 ONNX | ONNX Runtime | 320 | 26.4 | 28.5 / 36.2 | 34.6 | 198 | 3.1 |
| INT8 ONNX | OpenCV DNN | 320 | — | falhou: OpenCV 5.0 não executa o grafo QDQ | — | — | — |
| FP32 ONNX | ONNX Runtime | 416 | 29.6 | 32.6 / 41.9 | 30.2 | 221 | 10.6 |
| FP32 ONNX | ONNX Runtime | 512 | 43.2 | 47.2 / 66.1 | 20.3 | 240 | 10.6 |
| FP32 ONNX | ONNX Runtime | 640 | 61.1 | 67.1 / 87.1 | 14.6 | 273 | 10.7 |

Valores por estágio (incl. OpenCV DNN em 416/512/640) em `reports/examples/synthetic_x86/benchmark/benchmark.md`.
O RSS inclui ~15 MB das 50 imagens de benchmark mantidas em memória.

Sustentado 120 s (FP32 320, ONNX Runtime): 1 thread 29,3 ms p50 · 2 threads 26,6 ms · 4 threads
22,4 ms (escala fraca — vCPUs compartilhadas; repita no Pi, onde os 4 núcleos são dedicados).

### Precisão no split de teste (mesmo avaliador)

| Configuração | mAP50 | mAP50-95 | Recall defeitos | Recall pequenos (média) | Escape | REVIEW defeituosas |
|---|---:|---:|---:|---:|---:|---:|
| PyTorch 320 | 0.935 | 0.642 | 0.907 | 0.927 | 0.023 | 0.227 |
| ONNX FP32 320 (ORT e OpenCV) | **0.935** | **0.642** | **0.907** | **0.927** | **0.023** | 0.227 |
| ONNX INT8 320 | 0.902 | 0.620 | 0.870 | 0.902 | 0.045 | 0.182 |
| ONNX FP32 416 | 0.911 | 0.618 | 0.889 | 0.902 | 0.000 | 0.341 |
| ONNX FP32 512 | 0.700 | 0.393 | 0.704 | 0.703 | 0.000 | 0.705 |
| ONNX FP32 640 | 0.353 | 0.182 | 0.556 | 0.615 | 0.000 | 0.864 |

### Conclusões (válidas apenas para este experimento)

1. **Exportação ONNX FP32 sem perda**: métricas idênticas às do PyTorch; o teste de integração
   `test_pytorch_onnx_parity` também confirma caixas (IoU > 0,9) e confianças (|Δ| < 0,02).
2. **ONNX Runtime ≈ 2× mais rápido que PyTorch e com ~5× menos RAM** nesta máquina — base da
   escolha do ORT como padrão para o Pi (a confirmar em ARM).
3. **A quantização INT8 degradou defeitos finos**: recall de `scratch` caiu de 0,917 para 0,750
   (pequenos: 1,000 → 0,875), mAP50 0,935 → 0,902 e a taxa de escape dobrou (2,3% → 4,5%). O teste
   de regressão **reprovou** o INT8, e ele também foi **mais lento** em x86 (sem ganho que
   compense). Não adotar sem nova medição no Pi.
4. **Resolução de inferência ≠ de treino degrada**: o modelo treinado em 320 perde muito em
   512/640 (mudança de escala dos objetos). Treine na resolução de inferência e compare
   resoluções com modelos treinados para cada uma. Note que a taxa de escape cai para 0 em
   640 só porque quase tudo vira REVIEW — por isso o relatório mostra também as taxas de revisão.
5. **OpenCV DNN** executa FP32 (mais lento que ORT, menos RAM) mas falha no grafo INT8.
6. **Modo C** (PatchCore-lite) na validação: AUROC 0,95, recall 0,80 em defeituosas, 0% de falso
   alarme em 16 normais não usadas na calibração; **no teste não alterou a decisão** (escape 2,3%
   com e sem) ⇒ permanece desabilitado, conforme a regra de não combinar modos sem ganho comprovado.

O único defeito que escapou no teste é um risco claro sobre corpo branco com luz difusa
(contraste quase nulo) — caso para iluminação lateral rasante, não para mais software.
