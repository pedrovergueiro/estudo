# Guia de treinamento, avaliação e exportação

Treine na estação de treinamento. O Raspberry Pi **não** é usado para treinar.

## Treino

```bash
python scripts/train_model.py                                  # configs/train.yaml → experimento baseline
python scripts/train_model.py --experiment yolo11s
python scripts/train_model.py --set epochs=50 --set imgsz=960  # ajustes pontuais
```

Cada execução grava em `runs/train/<nome>-<data>/`:
`weights/best.pt` (melhor fitness na validação), `results.csv` (métricas por época), `args.yaml`
(hiperparâmetros efetivos), gráficos da Ultralytics e `experiment_manifest.json` com: pesos
iniciais (nome + SHA-256), SHA-256 do `best.pt`, seed, hiperparâmetros, hash da configuração,
SHA-256 do `data.yaml` e do `split_manifest.json`, versões de bibliotecas e plataforma.
`reports/experiments.csv` acumula uma linha por experimento.

Early stopping: `patience` (épocas sem melhora). Seeds: `seed` + `deterministic: true`.

### Aumentos de dados (padrão em `train.yaml`)

| Aumento | Valor | Motivo |
|---|---|---|
| `hsv_h` | 0.005 | a cor é informação (mancha/descoloração): matiz quase fixa |
| `hsv_s`, `hsv_v` | 0.30, 0.25 | variação moderada de saturação/exposição |
| `degrees`, `translate`, `scale` | 5°, 0.05, 0.20 | pequenas variações fisicamente plausíveis |
| `flipud`, `fliplr` | 0.5 | cápsula é simétrica |
| `shear`, `perspective` | 0 | criariam geometria irreal |
| `mosaic` | 0 (experimento `mosaic_on` = 0.5) | mosaico muda o contexto da estação; avaliar |
| `mixup` | 0 | sobrepor cápsulas transparentes cria "defeitos" artificiais |
| `erasing` | 0 | pode apagar o próprio defeito |

Aumentos **não** são evidência de generalização: apenas imagens reais independentes (teste) contam.

## Comparação de experimentos

Rode os experimentos e compare no **mesmo** split de teste:

```bash
for exp in baseline yolo11s imgsz_960_small_defects mosaic_on; do
  python scripts/train_model.py --experiment $exp
done
python scripts/evaluate_model.py --model runs/train/baseline-*/weights/best.pt --split test --out reports/eval_baseline
python scripts/evaluate_model.py --model runs/train/yolo11s-*/weights/best.pt --split test \
    --reference reports/eval_baseline/evaluation.json --out reports/eval_yolo11s
```

Critério de escolha (nessa ordem): recall das classes críticas, recall de defeitos **pequenos**,
taxa de escape, falsos positivos, latência medida no Pi. Uma perda de função de custo menor não
é critério de prontidão para produção.

## Avaliação

`evaluate_model.py` aceita `.pt`, `.onnx` e NCNN e gera `evaluation.{json,md}`,
`confusion_matrix.png`, `pr_curves.png`, `false_negatives.jpg`, `false_positives.jpg`.

- Ponto de operação = limiar de **revisão** de cada classe (o que deixa de virar REVIEW é FN).
- Recall por tamanho: pequeno (< 32² px), médio, grande — na resolução original.
- Decisão: taxa de escape (defeituosa → PASS), falsa rejeição (boa → FAIL), taxas de REVIEW.
- Estratos: `finish`, `color`, `lot`, `lighting`, `profile`. Com menos de 30 imagens ou 10
  defeitos o estrato é `NOT_VALIDATED`; `opaque/translucent/transparent` sempre aparecem, mesmo vazios.
- `--split train` emite aviso: não é medida de generalização.

### Calibração de limiares

```bash
python scripts/evaluate_model.py --model best.pt --split val --calibrate
```

Sugere, por classe, `review` = maior limiar com recall ≥ alvo (0,99 críticas / 0,95 demais) e
`fail` = menor limiar com precisão ≥ 0,90. **Não** é aplicado automaticamente: revise e copie para
`decision_rules.yaml`, incremente `rules_version` e reavalie no **teste**.

## Exportação e otimização

```bash
python scripts/export_model.py --weights best.pt --imgsz 320 416 512 640      # ONNX FP32 por resolução
python scripts/export_model.py --weights best.pt --imgsz 640 --int8           # + INT8 (calibração no train)
python scripts/export_model.py --weights best.pt --imgsz 640 --format ncnn
python scripts/benchmark_model.py --models models/export/best_*_fp32.onnx models/export/best_640_int8.onnx \
    --eval-split test       # latência + precisão por configuração, no hardware atual
```

Não escolha a menor resolução só pela velocidade: confira `recall_by_size.small` por classe.
Se a INT8 reduzir o recall de defeitos pequenos além da tolerância, mantenha FP32 e documente.

## Modo C (anomalias)

```bash
python scripts/train_anomaly.py                        # extrator leve (numpy/OpenCV)
python scripts/train_anomaly.py --extractor-onnx models/anomaly/backbone.onnx
```

Usa só cápsulas normais do treino, calibra o limiar com normais da validação (quantil 0,995) e
reporta AUROC, recall de defeituosas e falso alarme na validação. Habilite em `inference.yaml`
(`anomaly.enabled: true`) apenas se a combinação melhorar o resultado na validação independente.

## Segmentação (Modo B)

Requer máscaras (`working_dataset.task: segment`, polígonos YOLO). Use `--experiment seg_n`.
O backend ONNX decodifica os protótipos e devolve polígonos, desenhados na imagem anotada.
