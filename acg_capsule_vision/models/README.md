# Modelos

`models/cache/` (pesos pré-treinados baixados por `scripts/fetch_resources.py`) e os resultados de
treino em `runs/` ficam fora do Git.

Exceção documentada — `models/released/`:

| Arquivo | Conteúdo | SHA-256 | Licença |
|---|---|---|---|
| `detect_yolo11n_medical_pills.pt` | YOLO11n ajustado no Medical Pills (classe `pill`; localização, sem defeitos) | `d3380aa09173a24581d4511d9d09adba2281697fd74dd86ffb6bcf1d0a2fa1db` | AGPL-3.0 |
| `detect_yolo11n_medical_pills.run_manifest.json` | parâmetros, pesos iniciais, tempo, ambiente do treino | — | — |

Não publicados: YOLO11s ajustado (sem ganho no teste; reproduzível com `scripts/train_detect.py --stage B --model yolo11s`)
e o classificador normal × defeito (dataset Pill-Defects sem licença; reproduzível localmente com
`scripts/train_classify.py`). Verificar integridade: `sha256sum models/released/*.pt`.
