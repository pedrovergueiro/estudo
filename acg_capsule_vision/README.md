# ACG Capsule Vision AI — YOLO11 com datasets públicos

Protótipo de pesquisa para inspeção visual farmacêutica, treinado **somente com dados
públicos verificáveis**. Não está validado para a máquina de inspeção da ACG, para cápsulas de
gelatina, para outras cores/acabamentos, para iluminação industrial específica nem para a taxa
de produção. Resultados medidos: [reports/REPORT.md](reports/REPORT.md). Modelo: [MODEL_CARD.md](MODEL_CARD.md).

## O que foi encontrado nos datasets (resumo)

Detalhes e licenças em [DATASET_SOURCES.md](DATASET_SOURCES.md) e [LICENSES.md](LICENSES.md).

- Nenhum dataset obtível aqui tem **cápsulas de gelatina com defeitos anotados por caixa**.
- Chukyo e SensumSODF: hosts bloqueados nesta rede (não verificados); CapsuleDet: dados não publicados;
  PillQC: licença restrita a produtos MathWorks.
- Usados:
  - **Medical Pills** (Ultralytics, AGPL-3.0): caixas da classe `pill` em 115 quadros de um vídeo de
    blisters → **detector YOLO11 de localização** (não detecta defeitos).
  - **Pill-Defects** (licença ausente → só pesquisa): **comprimidos**, rótulo normal/defeito por
    imagem → **classificador YOLO11-cls**. 355 imagens = 10 comprimidos físicos fotografados
    repetidamente; avaliado deixando uma unidade física de fora (LOUO).

## Estrutura

```
configs/            resources.yaml (URLs + SHA-256), train_detect.yaml, train_classify.yaml, multiview.yaml
src/acg_vision/
  data/             fetch.py (download verificado), medical_pills.py (divisão temporal), pill_defects.py (unidades/LOUO)
  training/         detect.py (etapas A e B, retomada), classify.py (etapa A, LOUO, modelo final), common.py
  inference/        predictor.py (JSON + imagens anotadas, offline)
  evaluation/       matching.py, detect_eval.py, cls_eval.py
  multiview/        core.py (fontes, associação por ID, fusão conservadora)
  offline.py        bloqueio de rede, telemetria Ultralytics desligada, mensagens de recurso ausente
scripts/            fetch_resources, prepare_datasets, train_detect, train_classify, evaluate, infer,
                    run_multiview, benchmark, make_report
tests/              testes automatizados (pytest)
data/  models/      locais, fora do Git (exceção documentada: models/released/)
reports/            relatórios gerados
```

## Instalação (uma vez, com internet)

```bash
cd acg_capsule_vision
python3 -m venv .venv && source .venv/bin/activate
pip install torch==2.14.1 torchvision==0.29.1 --index-url https://download.pytorch.org/whl/cpu   # só CPU (não testado aqui; ver requirements.txt)
pip install -r requirements.txt
python scripts/fetch_resources.py          # ÚNICO passo que usa a rede; confere SHA-256 de tudo
```

`fetch_resources.py` baixa para `models/cache/` (pesos YOLO11 e fonte usada nos gráficos) e
`data/raw/` (Medical Pills; Pill-Defects fixado no commit `f2c0917`). Arquivo com hash
divergente é rejeitado. `--verify-only` confere o cache sem rede.

## Uso offline

Todos os scripts abaixo rodam com a **rede bloqueada** (`ACG_OFFLINE=1`, padrão): conexões para
fora de `localhost` falham com erro explícito, a telemetria da Ultralytics (`sync`) é desligada
e recursos ausentes geram mensagem com o comando exato para obtê-los.

```bash
python scripts/prepare_datasets.py                              # divisões (temporal / por unidade)

# Detecção — Etapa A (referência COCO) e Etapa B (ajuste fino)
python scripts/train_detect.py --stage A --model yolo11n
python scripts/train_detect.py --stage B --model yolo11n        # perfil cpu_conservative
python scripts/train_detect.py --stage B --model yolo11s
python scripts/evaluate.py detect --weights runs/detect/yolo11n_cpu_conservative/weights/best.pt --name yolo11n

# Classificação — Etapa A (ImageNet + classe majoritária), Etapa B (LOUO), modelo final
python scripts/train_classify.py --stage A
python scripts/train_classify.py --stage B
python scripts/evaluate.py classify --louo runs/classify/louo_cpu_conservative/louo_results.json
python scripts/train_classify.py --stage final

python scripts/make_report.py                                    # reports/REPORT.md
```

Teste rápido de todo o encadeamento: `--profile cpu_smoke` (minutos).
Ajuste de parâmetros sem editar arquivos: `--set epochs=60 --set batch=4 --set imgsz=512`.
GPU: no YAML ou `--set device=0`. O perfil `cpu_conservative` é ponto de partida, não uma
estimativa da sua máquina.

**Retomar treino interrompido** (suportado pela Ultralytics via `last.pt`):

```bash
python scripts/train_detect.py --resume runs/detect/<execução>/weights/last.pt
```

O classificador LOUO pode ser retomado por dobra: `python scripts/train_classify.py --stage B --units <unit_id> ...`.

## Inferência offline

```bash
python scripts/infer.py --weights models/released/detect_yolo11n_medical_pills.pt \
    --input pasta_ou_imagens/ --out reports/infer/teste
```

Saída: `predictions.json` (por imagem: detecções ou probabilidades, tempo, SHA-256 dos pesos,
vista de origem, etiqueta de proveniência) e `annotated/*.jpg`.

## Três vistas (ACG)

Geometria, ângulos, sincronização e aquisição das câmeras ainda são desconhecidos. O módulo
`multiview` oferece apenas: fonte local por manifesto CSV (`path, view_id, capsule_id|trigger_id`),
fonte de câmera como interface não implementada, associação **somente por identificador explícito**
(associação por horário desabilitada até haver tolerância medida) e fusão conservadora por regra
(qualquer vista acima do limiar → `DEFECT_SUSPECTED`; vista ausente/erro/sem evidência →
`INCONCLUSIVE`; nunca "aprovado"). Nenhuma fusão geométrica.

```bash
python scripts/run_multiview.py --weights <pesos de classificação> --manifest data/multiview/manifest.csv
```

## Benchmark no equipamento

```bash
python scripts/benchmark.py --weights <pesos.pt> --images data/prepared/medical_pills/images/test --iterations 200
python scripts/benchmark.py --weights <pesos.pt> --images <dir> --duration 1800 --threads 4   # estabilidade
```

Mede no próprio equipamento: latência p50/p95/p99, throughput, RSS de pico, deriva de latência,
erros, temperatura/frequência da CPU quando expostas. Só PyTorch em CPU: ONNX, TFLite e Hailo
não são habilitados sem verificação de compatibilidade no hardware real (modelo do Raspberry Pi
ainda não informado).

## Testes

```bash
python -m pytest -q
```

## Informações necessárias da ACG para avançar

1. Dataset próprio: cápsulas reais da linha (cores, acabamentos opaco/translúcido/transparente,
   tamanhos), defeitos de interesse com definição e tamanho mínimo, anotação por caixa ou máscara.
2. Câmeras: modelo, resolução, lente, interface, disparo, sincronização entre as três vistas,
   identificador de cápsula/disparo disponível por imagem.
3. Iluminação e fundo de cada vista.
4. Cadência (cápsulas/min) e latência máxima por decisão.
5. Modelo exato do Raspberry Pi (ou outro computador), SO e acessórios (acelerador?).
6. Decisão de licenciamento (AGPL × Ultralytics Enterprise) e termos dos datasets a usar.
