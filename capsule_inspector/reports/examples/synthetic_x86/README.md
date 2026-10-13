# Exemplo de execução completa — dados SINTÉTICOS, contêiner x86_64

> Sem valor de validação. Demonstra o formato dos relatórios e que o encadeamento
> dados → treino → avaliação → exportação → registro → inspeção → interface funciona.
> Não representa cápsulas reais nem desempenho em Raspberry Pi.

Reprodução (overlay `configs/examples/synthetic`, ~20 min em 4 vCPUs):

```bash
export CAPSULE_CONFIG_OVERLAY=configs/examples/synthetic
python scripts/make_synthetic_dataset.py --units 240 --views 2
python scripts/validate_dataset.py --split
python scripts/train_model.py
python scripts/evaluate_model.py --model runs/train_synthetic/<run>/weights/best.pt --split val --calibrate
python scripts/export_model.py --weights runs/train_synthetic/<run>/weights/best.pt --imgsz 320 --int8
python scripts/evaluate_model.py --model models/export/best_320_fp32.onnx --split test --baseline --out reports/eval_fp32_test
python scripts/evaluate_model.py --model models/export/best_320_int8.onnx --split test \
    --reference reports/eval_fp32_test/evaluation.json --out reports/eval_int8_test
python scripts/train_anomaly.py --out models/anomaly/synthetic_patchcore_lite.npz
python scripts/export_model.py --weights runs/train_synthetic/<run>/weights/best.pt --imgsz 320 --register --model-id synth-v1-320
python scripts/evaluate_model.py --model models/registry_synthetic/synth-v1-320/best_320_fp32.onnx --split test \
    --baseline --anomaly models/anomaly/synthetic_patchcore_lite.npz --out reports/eval_synth-v1-320_test
python scripts/manage_models.py approve synth-v1-320 --by "..." --report reports/eval_synth-v1-320_test/evaluation.json
python scripts/manage_models.py activate synth-v1-320 --by "..."
python scripts/run_inspection.py --images data/samples --continuous --lot DEMO-SINT-001
```

| Arquivo | Conteúdo |
|---|---|
| `dataset/` | validação do dataset e divisão por unidade física (168/36/36 unidades, sem vazamento) |
| `train_*` | manifesto do experimento, métricas por época, curvas |
| `eval_val_calibration/` | avaliação na validação + limiares sugeridos (n pequeno ⇒ instáveis) |
| `eval_test_fp32/` | teste do artefato registrado: por classe, tamanhos, estratos (todos NOT_VALIDATED: < 30 imagens), FP/FN, decisão com e sem Modo C |
| `eval_test_int8/` | INT8 com regressão contra FP32 — **REPROVADA** (recall de `scratch` 0,917 → 0,750) |
| `benchmark/`, `benchmark_sustained/` | latência/RAM por backend, precisão e resolução; threads 1/2/4 por 120 s |
| `anomaly_mode_c_report.json` | Modo C na validação |
| `inspections/` | registros completos de 3 inspeções do serviço + imagens anotadas + exportação CSV do lote |
| `interface_operador.png` | captura real da interface (Chromium headless) após uma revisão manual |

Nenhuma inspeção resultou em PASS: o perfil e as classes não estão validados, então o motor de
decisão rebaixa a REVIEW (`PASS_BLOCKED`) — comportamento intencional. As 12 cápsulas
defeituosas da amostra deram FAIL (`INCONCLUSIVE`, por classes não validadas) e as 12 boas, REVIEW.
