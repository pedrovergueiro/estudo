# Dados

Nenhum dado é versionado aqui. Estrutura, formatos, metadados obrigatórios (`unit_id`, `lot`,
`session`, `finish`, `color`, `lighting`, `profile`) e fontes públicas: ver
[docs/DATASET_GUIDE.md](../docs/DATASET_GUIDE.md).

```
raw/        originais intocados, um subdiretório por fonte (com a licença aceita)
interim/    convertidos para YOLO
processed/  dataset de trabalho (images/, labels/, metadata.csv)
splits/     train/val/test.txt, data.yaml, split_manifest.json
reports/    relatórios de validação do dataset
samples/    imagens para inspeções de teste (camera.yaml type: file)
```

Para testar sem dados reais:
`CAPSULE_CONFIG_OVERLAY=configs/examples/synthetic python scripts/make_synthetic_dataset.py`.
