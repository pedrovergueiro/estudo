# Arquitetura e decisões técnicas

## Fase 1 — Requisitos

### Requisitos funcionais (resumo rastreável)

| ID | Requisito | Onde |
|---|---|---|
| RF-01 | Localizar cada cápsula na imagem | classe `capsule` do detector; `inference/roi.py` (clássico) |
| RF-02 | Detectar e classificar defeitos visíveis | YOLO11 (Modo A) / YOLO11-seg (Modo B) |
| RF-03 | Delimitar a região (caixa/máscara) | `postprocess.py` (caixas e polígonos de máscara) |
| RF-04 | Separar defeito real de reflexo/sombra | treino com exemplos negativos + perfis de iluminação + pré-processamento + REVIEW para incerteza |
| RF-05 | Normal × suspeita | motor de decisão (`decision/rules.py`) |
| RF-06 | Baixa latência no Pi | ONNX Runtime CPU, imgsz configurável, benchmark |
| RF-07 | Treino externo | `training/` (estação) |
| RF-08 | Inferência offline | sem chamadas de rede no caminho de inspeção (teste `test_runs_offline`) |
| RF-09 | Resultados estruturados, imagens, logs, métricas | `storage/`, `logging_config.py`, `monitoring/` |
| RF-10 | Extensível (classes, produtos) | `configs/taxonomy.yaml`, `configs/lighting_profiles.yaml` |
| RF-11 | Anomalias desconhecidas | Modo C (`inference/anomaly.py`) |

### Requisitos não funcionais

- **Segurança do resultado**: nenhuma falha de software pode virar PASS; PASS exige condições validadas.
- **Rastreabilidade**: cada registro guarda modelo (id + SHA-256), versões e hash da configuração, perfil (nome + hash), tempos, qualidade, software e commit.
- **Reprodutibilidade**: seeds, manifesto de treino, divisão determinística, SHA-256 de pesos/dados.
- **Atualização controlada**: registro com aprovação humana e regressão obrigatória; rollback.

### Suposições explícitas (todas configuráveis)

| Suposição | Valor padrão | Onde mudar |
|---|---|---|
| Uma cápsula por imagem (estação de unidade única) | `expected_capsules: {min: 1, max: 1}` | `decision_rules.yaml` |
| Cápsula tamanho 0, 21,7 × 7,6 mm | `geometry` | `lighting_profiles.yaml` |
| Câmera UVC 1920×1080 MJPG, exposição manual | `usb` | `camera.yaml` |
| Resolução de inferência 640 | `model.imgsz` | `inference.yaml` |
| Limiares iniciais (não calibrados) | `class_thresholds` | `decision_rules.yaml` (recalibrar com `--calibrate`) |
| Iluminação fixa sem controlador | `NullLightingController` | `capture/base.py` (implemente `LightingController`) |
| Sem atuação física | `reject_actuator.enabled: false` | `system.yaml` |

## Fase 2 — Compatibilidade de hardware e bibliotecas

### Plataforma

- **Raspberry Pi 5 (8 GB)**: referência. **Pi 5 (4 GB)**: suficiente para YOLO11n/s ONNX (modelo < 40 MB; RSS a medir). **Pi 4**: secundário — mesma pilha, latência maior; valide com o benchmark.
- **SO**: Raspberry Pi OS **64 bits** obrigatório. ONNX Runtime não publica rodas armv7 (32 bits).
- **Python**: 3.11 (Bookworm) ou 3.13 (Trixie). Verificado com `pip download --platform manylinux_2_28_aarch64` que existem rodas aarch64 de todas as dependências fixadas em `requirements/raspberry_pi.txt` para ambos. numpy 2.5 exige Python ≥ 3.12, por isso o marcador de versão no arquivo.
- **CUDA não é requisito**; o Pi não tem GPU NVIDIA.

### Estratégias de aceleração comparadas

| Opção | Situação no projeto | Observação |
|---|---|---|
| PyTorch (Ultralytics) | backend `ultralytics` | Útil como referência de precisão; roda no Pi (roda aarch64 de torch existe, ~450 MB) mas é a opção mais pesada em RAM e instalação. Não é o padrão. |
| **ONNX Runtime CPU** | **padrão** (`backend: auto` para `.onnx`) | Sem PyTorch no dispositivo; otimizações de grafo `ORT_ENABLE_ALL`; threads configuráveis; paridade com a Ultralytics verificada por teste. |
| OpenCV DNN | backend `opencv_dnn` | Sem dependência extra, mas suporte a operadores do YOLO11 depende da versão do OpenCV; tratar como experimental e medir. |
| INT8 (ORT, QDQ estático) | `export_model.py --int8` | Só adote se o benchmark no Pi mostrar ganho **e** a avaliação não mostrar perda de recall em defeitos pequenos. |
| FP16 | não gerado por padrão | O provedor CPU do ORT executa a maioria dos kernels em FP32; FP16 em CPU ARM tende a não acelerar. Disponível (`--half`) apenas para experimento. |
| NCNN | `export_model.py --format ncnn` + backend `ultralytics` | Recomendado pela Ultralytics para ARM; requer o pacote `ncnn` e a Ultralytics no Pi. Avaliar com o benchmark. |
| NPU / acelerador (Hailo, Coral) | detectado (`/dev/hailo0`, `/dev/apex_0`), não implementado | Exige compilação específica do modelo e runtime do fornecedor; só considerar com hardware presente e validação própria. |

A escolha final do backend **deve** ser confirmada com `scripts/benchmark_model.py` no Pi real; os números de x86 em `docs/BENCHMARKS.md` não valem para ARM.

## Decisões de modelagem

1. **YOLO11 como detector principal**, `n` como referência de latência e `s` como referência de capacidade (experimento `yolo11s` em `train.yaml`). O modelo maior não é escolhido automaticamente: a decisão é por recall por classe + latência medida.
2. **Classe `capsule` + classes de defeito** em vez de uma classe "normal": o detector localiza a unidade e os defeitos; "normal" é a ausência de defeitos sob condições validadas. Isso permite associar defeitos à cápsula e checar presença/posição.
3. **Três modos independentes**: A (detecção), B (segmentação, `task: segment`, mesmas rotinas de pós-processamento com máscaras), C (anomalias, PatchCore-lite). A combinação não é automática: o Modo C só altera o resultado para REVIEW e deve ser habilitado apenas se a avaliação em validação independente mostrar ganho (recall de defeitos raros) com taxa de falso alarme aceitável — `scripts/train_anomaly.py` reporta AUROC, recall e falso alarme na validação.
4. **PatchCore-lite em vez de PatchCore/PaDiM completos no Pi**: o PatchCore original usa WideResNet50 (~70 M parâmetros) e banco de memória grande — custoso em RAM/latência para o Pi. A implementação aqui usa extrator leve (ou um backbone ONNX menor) e banco com coreset limitado. Para os modelos completos, use Anomalib (Apache-2.0) na estação.
5. **Métricas próprias** além das da Ultralytics: o mesmo avaliador mede `.pt`, ONNX FP32, ONNX INT8 e NCNN, de modo que a degradação por exportação/quantização (especialmente em defeitos pequenos) é comparável.
6. **Divisão por grupo físico** com fusão por quase-duplicatas (correlação de miniaturas 32×32). O dHash foi descartado após medição no conjunto sintético: com 64 bits, cápsulas diferentes colidiam (240 unidades colapsaram em 55 grupos); com 256 bits, ruído gaussiano σ=3 invertia 111 de 256 bits em fundo plano. A correlação de miniaturas separou recapturas (ruído, JPEG 70, +10% brilho, 2 px de deslocamento: NCC ≥ 0,996) de unidades diferentes (máx. 0,993; p99,9 = 0,96). O limiar 0,995 deve ser recalibrado com dados reais.

## Fluxo de execução (inspeção)

1. Inicialização: relatório de plataforma (CPU, RAM, SO, arquitetura, bibliotecas, provedores ORT, aceleradores), banco, fonte de imagem, gatilho, atuador.
2. Carregamento do modelo: somente do registro (`active.json`), verificação de SHA-256, nomes de classes = taxonomia, imgsz = configuração, aquecimento.
3. Captura de uma imagem por etapa de iluminação do perfil.
4. Verificação de qualidade (exposição, saturação especular, nitidez, imagem uniforme).
5. Pré-processamento do perfil (sem alterar geometria — verificado).
6. Inferência (por vista; fusão `late_union` ou `early_channels`).
7. Validação das coordenadas (finitas, dentro da imagem).
8. ROI das cápsulas (detector ou clássico); 2º estágio opcional por recorte.
9. Modo C opcional por cápsula.
10. Decisão (limiares por classe, gravidade, associação, bloqueios de PASS).
11. Anotação; 12. Persistência atômica; 13. Outbox opcional; 14. Atuador (fail-safe) e status.

Qualquer exceção em 3–12 produz SYSTEM_ERROR; falha de armazenamento também (o registro vai para `var/fallback_records.jsonl`).
