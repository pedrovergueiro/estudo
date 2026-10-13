# Dependências, licenças e restrições de uso

Não é aconselhamento jurídico. Confirme com o seu jurídico antes de uso comercial.

## Este repositório

Licenciado sob **AGPL-3.0** (arquivo `LICENSE`), para manter compatibilidade com a Ultralytics,
cujo código é usado pelo treinamento e cuja licença também cobre, segundo a Ultralytics, modelos
derivados dos seus pesos pré-treinados.

## Dependências (versões fixadas em `requirements/`)

| Pacote | Versão | Licença | Onde é usado |
|---|---|---|---|
| ultralytics | 8.4.176 | **AGPL-3.0** (licença Enterprise comercial disponível) | treino, exportação, backend opcional |
| pesos YOLO11 (`yolo11n.pt`, `yolo11s.pt`...) | v8.4.0 assets | **AGPL-3.0** | inicialização do treino |
| torch / torchvision | 2.14.1 / 0.29.1 | BSD-3 / Apache-2.0 e outras permissivas | treino |
| onnx | 1.23.2 | Apache-2.0 | exportação/quantização |
| onnxslim | 0.1.98 | MIT | exportação |
| onnxruntime | 1.31.0 | MIT | **inferência no Pi** |
| opencv-python-headless | 5.0.0.93 | Apache-2.0 | todo o projeto |
| numpy | 2.4.6 / 2.5.4 | BSD-3 (+ componentes permissivos) | todo o projeto |
| pydantic | 2.14.1 | MIT | configuração |
| PyYAML | 6.0.3 | MIT | configuração |
| fastapi / starlette | 0.143.0 / 1.8.0 | MIT / BSD-3 | interface |
| uvicorn | 0.54.0 | BSD-3 | interface |
| psutil | 7.2.2 | BSD-3 | monitoramento |
| picamera2 (apt) | do SO | BSD-2 | câmera CSI (opcional) |
| gpiozero (apt) | do SO | BSD-3 | GPIO (opcional) |
| pytest, httpx, ruff | dev | MIT / BSD-3 / MIT | testes |

## Restrições relevantes

- **AGPL-3.0 (Ultralytics)**: se você distribuir o software ou oferecê-lo como serviço em rede,
  deve disponibilizar o código-fonte correspondente sob AGPL. Para uso proprietário sem essas
  obrigações, a Ultralytics oferece licença Enterprise. O runtime no Pi não importa a Ultralytics
  (usa ONNX Runtime), mas o modelo exportado é derivado de pesos AGPL.
- **Datasets**: cada fonte tem termos próprios (vários são acadêmicos/não comerciais — ex.: MVTec AD
  CC BY-NC-SA 4.0). Modelos treinados com dados não comerciais podem herdar restrições. Registre a
  licença de cada fonte usada no treino (o `download_datasets.py` grava `LICENSE_ACCEPTED.txt`).
- **Anomalib** (sugerido para PatchCore/PaDiM completos na estação): Apache-2.0; backbones
  pré-treinados têm licenças próprias.
