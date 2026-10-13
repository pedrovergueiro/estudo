# Registro de alterações

Formato: versão — data — mudanças. Mudanças em modelo, taxonomia, regras, perfis, câmera ou
iluminação também são versionadas nos próprios arquivos de configuração (`*_version`) e cada
resultado de inspeção grava as versões e o hash da configuração aplicada.

## 0.1.0 — 2026-10-13

Primeira versão (experimental, não validada).

- Configuração validada (Pydantic) com taxonomia, perfis de iluminação, regras de decisão,
  câmera, sistema; overlay de configuração (`configs/examples/synthetic`).
- Dados: validação, conversão VOC/COCO/YOLO, divisão por unidade física com fusão de
  quase-duplicatas por correlação de miniaturas, relatórios.
- Treino YOLO11 reprodutível com manifesto; avaliação própria por classe/tamanho/estrato,
  calibração de limiares e regressão; exportação ONNX/NCNN; INT8 estático.
- Registro de modelos com aprovação e rollback.
- Inferência ONNX Runtime/OpenCV DNN/Ultralytics; ROI clássico; 2º estágio; PatchCore-lite.
- Motor de decisão PASS/FAIL/REVIEW/SYSTEM_ERROR; pipeline com falha segura; serviço contínuo.
- SQLite + imagens atômicas + retenção + outbox; interface FastAPI local.
- Benchmark com tempos por estágio, RAM e sensores; systemd; script de instalação no Pi.
