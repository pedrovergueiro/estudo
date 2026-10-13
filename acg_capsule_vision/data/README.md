# Dados (fora do Git)

- `raw/` — obtido por `python scripts/fetch_resources.py` (Medical Pills: zip AGPL-3.0 verificado por SHA-256;
  Pill-Defects: git fixado no commit `f2c0917`, licença ausente — só pesquisa interna).
- `prepared/` — gerado por `python scripts/prepare_datasets.py` (divisão temporal; unidades físicas `units.csv`).
- `multiview/manifest.csv` — manifesto de DEMONSTRAÇÃO: as "vistas" são quadros diferentes do mesmo comprimido
  de uma única câmera, apenas para exercitar associação e fusão. Não representam câmeras reais.
