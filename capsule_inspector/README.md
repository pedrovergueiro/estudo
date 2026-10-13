# Capsule Inspector — inspeção visual de cápsulas de gelatina com YOLO11 e Raspberry Pi

Sistema modular para **detectar, localizar e classificar defeitos visíveis** em cápsulas
farmacêuticas de gelatina (opacas, translúcidas e transparentes). O treinamento acontece em
uma estação externa (Ultralytics YOLO11 + PyTorch); a inspeção roda **offline no Raspberry Pi**
com ONNX Runtime (CPU), sem PyTorch no dispositivo.

> **Estado atual — leia antes de usar.** O software está implementado e testado (91 testes
> unitários + 7 de integração, ver [Testes](#testes)). **Nenhum peso treinado com cápsulas
> reais acompanha o repositório**: os pesos finais precisam ser produzidos com dados reais e
> validados (docs/VALIDATION_PLAN.md). As métricas e o benchmark publicados em
> `reports/examples/` foram obtidos com **dados sintéticos** e em um **contêiner x86_64**, não
> em um Raspberry Pi — servem apenas para demonstrar que o encadeamento funciona. Este sistema
> **apoia** o controle de qualidade; não está qualificado para uso farmacêutico regulamentado
> sem validação formal.

## Arquitetura

```
             ESTAÇÃO DE TREINAMENTO                              RASPBERRY PI (offline)
 ┌──────────────────────────────────────────────┐   ┌───────────────────────────────────────────────┐
 │ datasets (YOLO/VOC/COCO) → validação →         │   │ captura (USB/libcamera/arquivo) → qualidade →  │
 │ divisão por unidade física/lote → treino YOLO11│   │ pré-proc. do perfil → ONNX Runtime YOLO11 →     │
 │ → avaliação por classe/estrato → export ONNX   │──▶│ ROI da cápsula → [anomalia Modo C] → motor de  │
 │ (FP32 / INT8) → registro (candidate)           │   │ decisão → PASS/FAIL/REVIEW/SYSTEM_ERROR →       │
 │ → aprovação humana + regressão → ativação      │   │ imagem anotada → SQLite + imagens → interface  │
 └──────────────────────────────────────────────┘   └───────────────────────────────────────────────┘
```

| Camada | Módulo | Destaques |
|---|---|---|
| Configuração | `config.py`, `configs/*.yaml` | Pydantic estrito (chave desconhecida = erro), versões + hash SHA-256 gravados em cada resultado |
| Dados | `dataset/` | validação (corrompidos, duplicatas, rótulos, limites, desequilíbrio, vazamento), conversão VOC/COCO/YOLO, divisão por grupo físico com fusão de quase-duplicatas |
| Treino | `training/train.py` | seeds, manifesto com versões, SHA-256 dos pesos iniciais/finais, early stopping, log de experimentos |
| Avaliação | `training/metrics.py`, `evaluate.py` | métricas próprias independentes de backend: mAP50/50-95, P/R/F1, FN/FP por classe, recall de defeitos pequenos, matriz de confusão, curvas PR, galerias FP/FN, estratos (acabamento/cor/lote/iluminação) com `NOT_VALIDATED`, taxa de escape, calibração de limiares, regressão |
| Exportação | `training/export.py` | ONNX FP32, INT8 estático (QDQ, excluindo DFL), NCNN/OpenVINO via Ultralytics, manifesto |
| Registro | `registry.py` | candidate → approved (exige regressão aprovada + responsável) → active; rollback; verificação de SHA-256 ao carregar |
| Inferência | `inference/` | backends ONNX Runtime / OpenCV DNN / Ultralytics, letterbox idêntico ao da Ultralytics, NMS por classe, máscaras de segmentação, ROI clássico, 2º estágio por recorte, PatchCore-lite |
| Decisão | `decision/` | limiares `fail`/`review` por classe, gravidade, classes não validadas, qualidade de imagem, contagem de cápsulas, associação defeito→cápsula, bloqueios de PASS |
| Execução | `pipeline.py`, `runtime.py` | qualquer exceção ⇒ SYSTEM_ERROR; falha de armazenamento ⇒ SYSTEM_ERROR + spool local; atuador fail-safe desabilitado por padrão |
| Persistência | `storage/` | SQLite WAL `synchronous=FULL`, escrita atômica de imagens, revisões em tabela separada, retenção, outbox |
| Interface | `interface/` | FastAPI + HTML sem CDN, 127.0.0.1 por padrão, token obrigatório se exposta na rede |
| Monitoramento | `monitoring/` | plataforma, RAM, temperatura, frequência, `vcgencmd get_throttled`, tempos por estágio, benchmark |

Decisões técnicas detalhadas: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Instalação e execução (passo a passo)

Os comandos abaixo partem do diretório `capsule_inspector/`.

### 1–2. Estação de treinamento

```bash
python3 -m venv .venv && source .venv/bin/activate
# CPU apenas (evita baixar CUDA); para GPU NVIDIA siga pytorch.org e pule esta linha
pip install torch==2.14.1 torchvision==0.29.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements/development.txt
pip install -e . --no-deps
python -m pytest -q                  # 91 unitários + 7 integração
```

### 3. Importar e validar datasets

```bash
python scripts/download_datasets.py --list           # fontes, licenças, nada é baixado
python scripts/import_dataset.py coco --json data/raw/x/ann.json --images data/raw/x/img \
    --out data/processed/capsules_v0                  # ou voc / yolo
# preencha data/processed/capsules_v0/metadata.csv (unit_id, lot, session, finish, color, lighting)
python scripts/validate_dataset.py --split           # valida, divide por unidade física e revalida
```

Sem dados reais à mão, gere o conjunto sintético de demonstração:

```bash
export CAPSULE_CONFIG_OVERLAY=configs/examples/synthetic
python scripts/make_synthetic_dataset.py --units 240 --views 2
python scripts/validate_dataset.py --split
```

### 4–6. Treinar, avaliar, exportar

```bash
python scripts/train_model.py                                    # configs/train.yaml (baseline)
python scripts/train_model.py --experiment imgsz_960_small_defects
python scripts/evaluate_model.py --model runs/train/<run>/weights/best.pt --split val --calibrate
python scripts/export_model.py --weights runs/train/<run>/weights/best.pt --imgsz 640 --int8
python scripts/evaluate_model.py --model models/export/best_640_fp32.onnx --split test --baseline
python scripts/export_model.py --weights runs/train/<run>/weights/best.pt --imgsz 640 \
    --register --model-id caps-v1-640
python scripts/manage_models.py approve caps-v1-640 --by "Nome (QA)" \
    --report reports/eval_best_640_fp32_test/evaluation.json
python scripts/manage_models.py activate caps-v1-640 --by "Nome (QA)"
```

`<run>` é o diretório criado pelo treino (impresso ao final, ex.: `baseline-20251013-101500`).

### 7. Transferir para o Raspberry Pi

```bash
rsync -av --exclude .venv --exclude runs --exclude 'data/*' --exclude var \
    ./ operador@raspberrypi.local:~/capsule_inspector/
```

O registro (`models/registry/`) vai junto: o Pi só carrega o modelo de `active.json` e confere o SHA-256.

### 8–9. Dependências e câmera no Pi

```bash
ssh operador@raspberrypi.local
cd ~/capsule_inspector
bash scripts/setup_raspberry_pi.sh             # USB/UVC; use --with-picamera para câmera CSI
v4l2-ctl --list-devices && v4l2-ctl -d /dev/video0 --list-ctrls   # ajuste configs/camera.yaml
```

### 10. Inspeção de teste

```bash
.venv/bin/python scripts/run_inspection.py --once --lot TESTE-001
.venv/bin/python scripts/run_inspection.py --images data/samples --max 20
.venv/bin/python scripts/benchmark_model.py --models models/registry/caps-v1-640/best_640_fp32.onnx --iterations 200
```

### 11. Serviço automático

```bash
bash scripts/setup_raspberry_pi.sh --install-service
sudo systemctl start capsule-inspector capsule-inspector-ui
```

Interface: `http://127.0.0.1:8080` no próprio Pi (ou túnel `ssh -L 8080:127.0.0.1:8080 operador@raspberrypi.local`).

### 12. Logs e resultados

```bash
journalctl -u capsule-inspector -f
tail -f var/logs/capsule_inspector.log           # JSON por linha, rotação por tamanho
sqlite3 var/inspections.sqlite3 "SELECT ts,status,lot_id FROM inspections ORDER BY ts DESC LIMIT 10"
curl -s http://127.0.0.1:8080/api/export.csv > inspecoes.csv
```

### 13. Atualizar modelo com rollback

```bash
python scripts/evaluate_model.py --model models/export/novo.onnx --split test \
    --reference reports/eval_atual_test/evaluation.json      # regressão contra o modelo atual
python scripts/manage_models.py approve caps-v2-640 --by "Nome (QA)" --report reports/eval_novo_test/evaluation.json
python scripts/manage_models.py activate caps-v2-640 --by "Nome (QA)" && sudo systemctl restart capsule-inspector
python scripts/manage_models.py rollback --by "Nome (QA)" && sudo systemctl restart capsule-inspector
```

## Pacote offline para Raspberry Pi (`capsule-inspector`)

Gera um `.tar.gz` com aplicativo, modelo ONNX, imagens de exemplo e **todas as dependências
ARM64** (Python 3.11 = Raspberry Pi OS Bookworm; 3.13 = Trixie). No Pi não precisa de internet,
pip nem venv: `./instalar.sh` extrai as dependências, cria o comando `capsule-inspector` e roda
um autoteste. Comandos: `pasta`, `camera` (USB UVC ou câmera CSI via `rpicam-vid`, detecção
automática), `interface [--rede]`, `iniciar`, `diagnostico`, `teste`, `exportar`. Guia do usuário:
[packaging/pi/LEIA-ME.md](packaging/pi/LEIA-ME.md).

```bash
python packaging/build_pi_bundle.py --model <detector.onnx> --model-info <info.json> \
    --examples <imagens...> --examples-license <licença> --out dist/          # aarch64
python packaging/build_pi_bundle.py ... --arch x86_64                         # pacote de teste em PC
```

O pacote 0.1.0 usa o detector YOLO11n do projeto `acg_capsule_vision` (Medical Pills, classe
única `pill`), exportado para ONNX e conferido contra o PyTorch no teste (405/405 caixas; 13 FP
× 14 FP). Ele localiza e conta; não detecta defeitos — todo resultado sai como REVIEW.

## Estados de resultado

| Estado | Quando |
|---|---|
| `PASS` | inspeção completa, qualidade OK, cápsula localizada, nenhuma detecção ≥ limiar de revisão, **e** perfil, modelo e classes críticas validados |
| `FAIL` | defeito acima do limiar `fail` (classe validada ⇒ `DEFECT_CONFIRMED`; não validada ⇒ rejeição conservadora, `INCONCLUSIVE`) |
| `REVIEW` | confiança entre `review` e `fail`, defeito leve, anomalia visual, qualidade ruim, contagem/posição de cápsula anômala, ou PASS bloqueado por falta de validação |
| `SYSTEM_ERROR` | qualquer falha de software, câmera, modelo ou armazenamento — **nunca vira aprovação** |

## Testes

```bash
python -m pytest -q                 # tudo (integração exige ultralytics+torch)
python -m pytest tests/unit -q      # runtime do Pi (sem PyTorch)
python -m pytest -m slow -q         # só integração: treino real → ONNX → paridade → INT8 → serviço
```

Executados neste repositório (ver docs/BENCHMARKS.md para o ambiente): 91 unitários em Python 3.13
(ambiente completo) e em Python 3.11 + numpy 2.4.6 **sem PyTorch** (espelho do runtime do Pi);
7 de integração em Python 3.13 com Ultralytics 8.4.176 / PyTorch 2.14.1 CPU.

## Documentação

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — requisitos, decisões e justificativas (fases 1–2)
- [DATASET_GUIDE.md](docs/DATASET_GUIDE.md) — formatos, fontes públicas, metadados, divisão
- [TRAINING_GUIDE.md](docs/TRAINING_GUIDE.md) — treino, experimentos, avaliação, calibração, exportação
- [RASPBERRY_PI_SETUP.md](docs/RASPBERRY_PI_SETUP.md) — instalação, serviço, atualização
- [CAMERA_AND_LIGHTING.md](docs/CAMERA_AND_LIGHTING.md) — aquisição, iluminação, cápsulas transparentes
- [ADDING_CLASSES.md](docs/ADDING_CLASSES.md) — novas classes e novos produtos
- [BENCHMARKS.md](docs/BENCHMARKS.md) — como medir e o que já foi medido
- [VALIDATION_PLAN.md](docs/VALIDATION_PLAN.md) — plano de validação antes do uso industrial
- [LIMITATIONS.md](docs/LIMITATIONS.md) — limitações conhecidas
- [LICENSES.md](docs/LICENSES.md) — dependências, licenças e restrições
- [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- [CHANGELOG.md](CHANGELOG.md)

## Licença

AGPL-3.0 (ver [LICENSE](LICENSE)), alinhada à licença da Ultralytics usada no treinamento.
Leia [docs/LICENSES.md](docs/LICENSES.md) antes de uso comercial.
