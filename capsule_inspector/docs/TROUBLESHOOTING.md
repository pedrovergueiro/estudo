# Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| Todo resultado é `REVIEW` com `PASS_BLOCKED` | sistema não validado (comportamento esperado) | validar perfil/classes/modelo (VALIDATION_PLAN.md); em bancada, ver os motivos na interface |
| `SYSTEM_ERROR: nenhum modelo ativo` | registro vazio | `manage_models.py list`; registrar, aprovar e ativar |
| `SHA-256 divergente` | artefato alterado/corrompido | recopiar o diretório do registro; `manage_models.py verify` |
| `classes do modelo ... != taxonomia` | modelo treinado com outra taxonomia | re-treinar ou restaurar a taxonomia da versão do modelo |
| `modelo exportado com imgsz=...` | `inference.yaml` difere do export | exportar no imgsz desejado ou ajustar `model.imgsz` |
| `câmera USB indisponível` | dispositivo errado, cabo, energia | `v4l2-ctl --list-devices`; use `/dev/v4l/by-id/...`; hub USB alimentado |
| Câmera recusou resolução (log) | formato não suportado | `v4l2-ctl --list-formats-ext`; ajuste `fourcc`/resolução |
| Exposição não fixa | controle V4L2 com outro nome/escala | `v4l2-ctl --list-ctrls`; ajuste `exposure`; alguns modelos exigem `auto_exposure` = 1 via v4l2-ctl |
| `QUALITY: SPECULAR_SATURATION` | reflexo forte | difusor, polarização cruzada, menor exposição, ângulo de luz |
| `QUALITY: BLURRY` | foco, vibração, movimento | foco manual fixo, menor exposição, luz estroboscópica |
| `CAPSULE_COUNT` | cápsula não detectada / duas no quadro | posição/gatilho; `roi.method: classical` como verificação |
| `espaço em disco abaixo de ...` | retenção insuficiente | reduzir `retention.*_days`/`max_images_gb`; o resultado vira SYSTEM_ERROR até liberar espaço |
| Latência alta / FPS caindo ao longo do tempo | throttling térmico ou subtensão | `vcgencmd get_throttled`; dissipador ativo; fonte oficial; ver status na interface |
| `interface.host ... não é local` | host remoto sem token | definir `CAPSULE_UI_TOKEN` ou voltar a 127.0.0.1 |
| Interface mostra "serviço PARADO" | `status.json` > 15 s | `systemctl status capsule-inspector`; `journalctl -u capsule-inspector` |
| `onnxruntime` não instala no Pi | SO 32 bits | reinstalar Raspberry Pi OS 64 bits |

## Picamera2 e numpy

No Bookworm, `python3-picamera2` (apt) e suas extensões compiladas são construídas contra o numpy
1.x do sistema. Num venv com `--system-site-packages`, o numpy 2.x instalado pelo pip tem
precedência e pode causar `numpy.dtype size changed` ou falha de importação de `simplejpeg`.
Opções, em ordem de preferência: câmera UVC/USB (padrão); Raspberry Pi OS Trixie (numpy 2 no
sistema); ou um processo de captura separado usando o Python do sistema. Teste sempre com
`.venv/bin/python -c "import picamera2, numpy"` (o script de setup faz isso).

## Diagnóstico

```bash
.venv/bin/python scripts/system_report.py
.venv/bin/python scripts/run_inspection.py --once            # imprime o registro completo
cat var/status.json
tail -n 50 var/logs/capsule_inspector.log
tail -n 5 var/fallback_records.jsonl                         # registros que não couberam no banco
```
