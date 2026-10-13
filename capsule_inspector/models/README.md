# Modelos

**Nenhum peso treinado acompanha este repositório.** Os pesos de produção precisam ser treinados
com imagens reais da linha e validados (docs/VALIDATION_PLAN.md).

```
models/
  export/                 saídas de scripts/export_model.py (ONNX/NCNN + <arquivo>.manifest.json)
  registry/               registro de produção
    <model_id>/           artefato imutável + manifest.json (SHA-256, classes, imgsz, aprovações)
    active.json           modelo ativo + histórico (só muda via scripts/manage_models.py)
  registry_synthetic/     registro usado pelo overlay sintético (testes)
  anomaly/                modelos do Modo C (scripts/train_anomaly.py)
```

Ciclo de vida: `export_model.py --register` (candidate) → `manage_models.py approve`
(exige relatório de teste com `regression.passed: true` e o nome do responsável) →
`manage_models.py activate` → `rollback` se necessário. A inferência verifica o SHA-256 a cada
carga e recusa modelos cujas classes não coincidem com a taxonomia habilitada.

Os artefatos (`*.pt`, `*.onnx`, registros) são ignorados pelo git por tamanho e licença
(pesos derivados de YOLO11 são AGPL-3.0); distribua-os pelo canal controlado do seu processo.
