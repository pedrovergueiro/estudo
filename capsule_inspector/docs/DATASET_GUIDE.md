# Guia de datasets

## Estrutura

```
data/
  raw/         dados originais, intocados (um subdiretório por fonte)
  interim/     convertidos para YOLO, antes de curadoria
  processed/   dataset de trabalho: images/, labels/, metadata.csv
  splits/      train.txt, val.txt, test.txt, data.yaml, split_manifest.json
  reports/     relatórios de validação (JSON, Markdown, gráficos, mosaico)
```

Nada em `data/` é versionado (ver `.gitignore`). Versione `metadata.csv`, `split_manifest.json`
e os relatórios num sistema de dados controlado se o processo exigir.

## Formatos aceitos

| Formato | Comando |
|---|---|
| YOLO detecção (`cls cx cy w h`, normalizado) | uso direto ou `import_dataset.py yolo --names ...` para remapear classes |
| YOLO segmentação (`cls x1 y1 x2 y2 ...`) | idem, `--task segment` |
| Pascal VOC (XML) | `import_dataset.py voc --xml ... --images ...` (convenção 1-based da Ultralytics) |
| COCO (JSON; bbox e polígonos) | `import_dataset.py coco --json ... --images ... [--task segment]` (RLE é ignorado e reportado) |
| Classificação / máscaras de anomalia (ex.: MVTec AD) | Modo C: use só as imagens normais para `train_anomaly.py`; as máscaras servem para avaliação externa |

Classes externas são mapeadas pelos `aliases` da taxonomia ou por `--map nome=chave`. Classes sem
correspondência aparecem em `conversion_report.json` (nunca são descartadas em silêncio); `--strict` aborta.

## Metadados obrigatórios para uma divisão confiável

`metadata.csv` (uma linha por imagem):

| coluna | exemplo | uso |
|---|---|---|
| `image` | `images/u0001_back.png` | chave |
| `unit_id` | `U0001` | **todas as vistas da mesma cápsula física** — nunca separadas entre splits |
| `lot` | `L2025-07` | divisão por lote / `holdout_lots`; estratos de avaliação |
| `session` | `S3` | sessão de aquisição |
| `finish` | `opaque` / `translucent` / `transparent` | estratos de avaliação |
| `color` | `red_white` | estratos |
| `lighting` | `backlight` | estratos |
| `profile` | `transparent_clear` | perfil de aquisição usado |

Sem `metadata.csv`, o relatório marca `METADATA_ABSENT` e a divisão cai para imagem a imagem —
o vazamento por unidade física **não pode ser excluído** e isso fica registrado.

## Verificações (`scripts/validate_dataset.py`)

`IMAGE_CORRUPT`, `IMAGE_UNREADABLE`, `IMAGE_NOT_8BIT`, `LABEL_MISSING`, `LABEL_INVALID`,
`LABEL_ORPHAN`, `CLASS_OUT_OF_RANGE`, `BOX_OUT_OF_BOUNDS`, `BOX_DEGENERATE`, `BOX_TOO_SMALL`,
`LABEL_DUPLICATE_BOX`, `SEG_WITHOUT_POLYGON`, `ASPECT_RATIO`, `DUPLICATE_EXACT`, `CLASS_IMBALANCE`,
`INSUFFICIENT_DATA`, `METADATA_MISSING`, `METADATA_ABSENT`, e vazamentos: `exact_duplicate`,
`near_duplicate` (correlação de miniaturas ≥ `near_duplicate_ncc`) e `group_<coluna>`.
Erros ou vazamentos fazem o script sair com código 1.

Relatórios: `dataset_validation.{json,md}`, `class_distribution.png`, `annotation_samples.jpg`
(amostra visual priorizando imagens com defeitos).

## Divisão

`group_aware_split` agrupa por `unit_id` (ou a primeira coluna disponível de `split.group_by`),
funde grupos com quase-duplicatas, envia `holdout_lots` inteiros para teste e atribui os grupos
de forma gulosa estratificada pela classe mais rara do grupo. Determinística pela `seed`.

## Fontes públicas

`python scripts/download_datasets.py --list` mostra as fontes configuradas. **Nenhuma é baixada
automaticamente.** Situação conhecida (confirme na fonte oficial; termos mudam):

| Fonte | Acesso | Licença / uso | Observação |
|---|---|---|---|
| Medicinal Capsule Image Dataset (Chukyo University) | por solicitação aos autores | acadêmico (verificar) | taxonomia própria — mapear via aliases |
| PillQC | verificar publicação | verificar | comprimidos/cápsulas: confira se há cápsulas de gelatina |
| Pill-Defects | verificar página do dataset | varia por versão | pode vir em YOLO/COCO |
| CapsuleDet | se o acesso for concedido | verificar | — |
| SensumSODF | por solicitação | possivelmente só pesquisa | classificação + máscaras |
| MVTec AD (categoria *capsule*) | formulário | CC BY-NC-SA 4.0 (não comercial) | útil para o Modo C |

Para baixar via script uma fonte com URL direta, preencha `direct_url` **e** `sha256` em
`configs/dataset.yaml` após verificar a origem, e rode com `--accept-license`.

Datasets públicos raramente reproduzem a sua estação (câmera, luz, fundo, produto): use-os para
pré-treino/fine-tuning, mas **a validação deve ser feita com imagens da sua linha**.

## Dados sintéticos

`scripts/make_synthetic_dataset.py` gera cápsulas renderizadas (opacas/translúcidas/transparentes,
reflexo especular, sombreamento, 5 tipos de defeito) com `metadata.csv`. Servem **somente** para
testar o software; o avaliador marca o relatório com "CONJUNTO SINTÉTICO".
