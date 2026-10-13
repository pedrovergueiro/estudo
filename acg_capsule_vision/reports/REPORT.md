# Relatório de métricas — ACG Capsule Vision AI

> Modelos treinados **somente com dados públicos**. Nenhuma métrica abaixo vale para a máquina da ACG,
> para cápsulas de gelatina, para outras cores/acabamentos ou para a iluminação industrial da ACG.

## 1. Dados utilizados

**Medical Pills** (detecção, 1 classe `pill`, quadros de um único vídeo; divisão por blocos temporais)

| Conjunto | Imagens | Caixas | Quadros |
|---|---:|---:|---|
| train | 70 | 1265 | 0–276 |
| val | 18 | 287 | 288–356 |
| test | 23 | 405 | 368–456 |
| descartados (fronteiras) | 4 | — | [280, 284, 360, 364] |

Tamanho mediano da caixa (treino): 188 × 151 px em imagens 1920×1080.

**Pill-Defects** (classificação normal × defeito, COMPRIMIDOS, 512×512 cinza)

355 imagens, mas apenas **10 unidades físicas** (2 normais, 8 defeituosas). Imagens por classe: {'defect': 215, 'normal': 140}. O `data.csv` original lista só 260 das imagens.

| Unidade | Classe | Quadros | MAE máx. ao 1º quadro |
|---|---|---:|---:|
| defect-s6-f571-630 | defect | 60 | 3.096 |
| defect-s6-f1561-1602 | defect | 42 | 1.637 |
| defect-s6-f2421-2438 | defect | 18 | 1.248 |
| defect-s6-f2931-2946 | defect | 16 | 1.073 |
| defect-s6-f4115-4145 | defect | 31 | 1.333 |
| defect-s6-f5992-6007 | defect | 16 | 1.103 |
| defect-s6-f6442-6457 | defect | 16 | 1.016 |
| defect-s6-f6862-6877 | defect | 16 | 1.07 |
| normal-s6-f443-538 | normal | 96 | 2.065 |
| normal-s7-f576-619 | normal | 44 | 1.299 |

## 2. Detecção (Medical Pills) — Etapa A × Etapa B, conjunto de TESTE

| Modelo | mAP50 | mAP50-95 | Precisão | Recall | F1 |
|---|---:|---:|---:|---:|---:|
| yolo11n COCO pré-treinado (Etapa A, class-agnóstico, conf 0.25) | — | — | 0.763 | 0.247 | 0.373 |
| yolo11n ajustado (Etapa B) — curva | 0.995 | 0.789 | 0.993 | 0.989 | 0.991 |
| yolo11n ajustado (Etapa B) — conf 0.25 | — | — | 0.967 | 1.000 | 0.983 |
| yolo11s COCO pré-treinado (Etapa A, class-agnóstico, conf 0.25) | — | — | 0.846 | 0.528 | 0.650 |
| yolo11s ajustado (Etapa B) — curva | 0.995 | 0.791 | 0.983 | 1.000 | 0.991 |
| yolo11s ajustado (Etapa B) — conf 0.25 | — | — | 0.971 | 1.000 | 0.985 |

Latência: ver seção 4 (medida com aquecimento e máquina ociosa). Tempo de treino: o yolo11n foi treinado com a CPU compartilhada com a validação cruzada do classificador; o yolo11s, com bem menos concorrência (só testes curtos em paralelo) — os tempos não são comparáveis entre si.

- Etapa A yolo11n: classes COCO preditas sobre comprimidos: {'cup': 97, 'dining table': 24, 'cake': 7, 'bottle': 2, 'bowl': 1}
- Etapa B yolo11n: treino 37.5 min em CPU, parâmetros {'device': 'cpu', 'imgsz': 640, 'epochs': 40, 'patience': 15, 'batch': 8, 'workers': 2, 'optimizer': 'auto', 'cos_lr': False, 'cache': False}, best.pt SHA-256 `d3380aa09173a245…`
- Exemplos yolo11n (verde = caixa real encontrada, vermelho = perdida, azul = predição correta, laranja = falso positivo; imagens Medical Pills, AGPL-3.0): [best_Frame_380.jpg](detect/yolo11n_test/examples/best_Frame_380.jpg), [best_Frame_384.jpg](detect/yolo11n_test/examples/best_Frame_384.jpg), [worst_Frame_372.jpg](detect/yolo11n_test/examples/worst_Frame_372.jpg), [worst_Frame_368.jpg](detect/yolo11n_test/examples/worst_Frame_368.jpg)
- Etapa A yolo11s: classes COCO preditas sobre comprimidos: {'cup': 208, 'dining table': 24, 'chair': 7, 'bowl': 7, 'cake': 3, 'orange': 2, 'fork': 1, 'spoon': 1}
- Etapa B yolo11s: treino 36.9 min em CPU, parâmetros {'device': 'cpu', 'imgsz': 640, 'epochs': 40, 'patience': 15, 'batch': 8, 'workers': 2, 'optimizer': 'auto', 'cos_lr': False, 'cache': False}, best.pt SHA-256 `1b9c064a5dbb06f8…`
- Exemplos yolo11s (verde = caixa real encontrada, vermelho = perdida, azul = predição correta, laranja = falso positivo; imagens Medical Pills, AGPL-3.0): [best_Frame_380.jpg](detect/yolo11s_test/examples/best_Frame_380.jpg), [best_Frame_384.jpg](detect/yolo11s_test/examples/best_Frame_384.jpg), [worst_Frame_372.jpg](detect/yolo11s_test/examples/worst_Frame_372.jpg), [worst_Frame_368.jpg](detect/yolo11s_test/examples/worst_Frame_368.jpg)

## 3. Classificação de defeitos (Pill-Defects) — validação cruzada por unidade física (LOUO)

- Etapa A (ImageNet, sem classes normal/defeito): top-1 ImageNet por classe real = {'defect': {'frying_pan': 215}, 'normal': {'frying_pan': 140}}
- Linha de base classe majoritária (sempre `defect`): acurácia 0.606, recall normal 0.000

Perfil `cpu_conservative`; tempo total de treino das 10 dobras: 32.1 min.

Matriz de confusão (imagens de teste de todas as dobras; linhas = real):

| real \ predito | normal | defect |
|---|---:|---:|
| normal | 44 | 96 |
| defect | 0 | 215 |

- Acurácia 0.730 · acurácia balanceada 0.657 · AUC (agrupada) 0.988
- Defeito: precisão 0.691, recall 1.000, F1 0.817
- Normal: precisão 1.000, recall 0.314, F1 0.478
- Unidades corretas por voto majoritário: **9 de 10**

| Unidade de teste | Classe | Quadros | Acurácia nos quadros |
|---|---|---:|---:|
| defect-s6-f1561-1602 | defect | 42 | 1.000 |
| defect-s6-f2421-2438 | defect | 18 | 1.000 |
| defect-s6-f2931-2946 | defect | 16 | 1.000 |
| defect-s6-f4115-4145 | defect | 31 | 1.000 |
| defect-s6-f571-630 | defect | 60 | 1.000 |
| defect-s6-f5992-6007 | defect | 16 | 1.000 |
| defect-s6-f6442-6457 | defect | 16 | 1.000 |
| defect-s6-f6862-6877 | defect | 16 | 1.000 |
| normal-s6-f443-538 | normal | 96 | 0.000 |
| normal-s7-f576-619 | normal | 44 | 1.000 |

Exemplos de acertos e erros: `reports/classify/examples_acertos_erros.jpg` — gerado localmente por `scripts/evaluate.py classify`; **não versionado**, pois contém imagens do Pill-Defects (licença desconhecida).

> imagens de uma mesma unidade são quase idênticas: o tamanho efetivo da amostra é o nº de UNIDADES (10), não de imagens (355)

## 4. Benchmark nesta máquina

| Pesos | Dispositivo | imgsz | p50 ms | p95 ms | img/s | RSS pico MB | deriva | erros | máx ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| yolo11n_cpu_conservative (detect, 100 iterações) | x86_64 | 640 | 61.4 | 74.1 | 15.982 | 902.2 | 1.066 | 0 | 79 |
| yolo11s_cpu_conservative (detect, 100 iterações) | x86_64 | 640 | 139.0 | 169.3 | 7.136 | 969.5 | 1.019 | 0 | 182 |
| final_cpu_conservative (classify, 200 iterações) | x86_64 | 224 | 21.3 | 29.9 | 44.256 | 763.0 | 0.954 | 0 | 42 |
| yolo11n_cpu_conservative (detect, 300 s contínuos) | x86_64 | 640 | 75.0 | 94.6 | 13.087 | 903.5 | 1.048 | 0 | 909 |

Detecção: imagens 1920×1080 redimensionadas para 640; classificação: 512×512 para 224. Latência inclui pré e pós-processamento (`predict` da Ultralytics, PyTorch CPU). Estes números valem **apenas para a máquina listada** (vCPUs compartilhadas). O Raspberry Pi não foi testado.

## 5. Ambiente

```
{
  "python": "3.13.16",
  "os": "Linux-6.18.44-fc-v114-x86_64-with-glibc2.39",
  "machine": "x86_64",
  "cpu": "Intel(R) Xeon(R) Processor @ 2.80GHz",
  "cpu_count": 4,
  "ram_mb": 16093,
  "gpu": null,
  "libraries": {
    "ultralytics": "8.4.176",
    "torch": "2.14.1",
    "torchvision": "0.29.1",
    "numpy": "2.5.4",
    "opencv-python": "5.0.0.93",
    "opencv-python-headless": "5.0.0.93",
    "PyYAML": "6.0.3"
  }
}
```

## 6. Limitações e riscos de generalização

Ver MODEL_CARD.md e DATASET_SOURCES.md. Em resumo: nenhum dado é de cápsula de gelatina com defeito;
o detector só localiza comprimidos/cápsulas em blister de um único vídeo; o classificador de defeitos foi
avaliado em 10 comprimidos físicos (2 normais) — amostra pequena demais para estimar desempenho real.
