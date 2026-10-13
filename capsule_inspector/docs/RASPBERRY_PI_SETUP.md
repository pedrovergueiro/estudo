# Instalação no Raspberry Pi

> A validação de desempenho embarcado **permanece pendente**: este repositório foi desenvolvido e
> testado em contêiner x86_64. O runtime do Pi foi exercitado em Python 3.11 + numpy 2.4.6 sem
> PyTorch (mesmas versões de `requirements/raspberry_pi.txt`) e a existência das rodas aarch64 foi
> verificada, mas nada foi executado em hardware Raspberry Pi.

## Requisitos

- Raspberry Pi 5 (8 GB referência, 4 GB econômico) ou Pi 4 (secundário).
- Raspberry Pi OS **64 bits** (Bookworm/Python 3.11 ou Trixie/Python 3.13).
- Dissipador ativo (o teste prolongado mede temperatura e throttling — sem refrigeração o Pi 5
  reduz a frequência sob carga contínua).
- Fonte oficial (subtensão aparece em `vcgencmd get_throttled` e no status da interface).
- Câmera UVC (USB 3.0) ou câmera CSI compatível com libcamera.

## Instalação

```bash
sudo apt update && sudo apt full-upgrade -y
git clone <seu-repositório> ~/capsule_inspector   # ou rsync a partir da estação
cd ~/capsule_inspector
bash scripts/setup_raspberry_pi.sh                 # USB
bash scripts/setup_raspberry_pi.sh --with-picamera # CSI
```

O script verifica `aarch64`, instala `python3-venv v4l-utils sqlite3 python3-gpiozero`
(+ `python3-picamera2`), cria `.venv`, instala `requirements/raspberry_pi.txt`, gera
`reports/platform_<host>.json` e roda os testes unitários.

## Modelo

Copie o diretório do registro (`models/registry/`) com o modelo aprovado e ativo. Verifique:

```bash
.venv/bin/python scripts/manage_models.py list
.venv/bin/python scripts/manage_models.py verify
```

## Configuração da câmera

```bash
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext
v4l2-ctl -d /dev/video0 --list-ctrls          # nomes e faixas de exposure/white balance/focus
```

Edite `configs/camera.yaml` (`type: usb`, `device`, resolução, `exposure`). Prefira
`/dev/v4l/by-id/...` para que o dispositivo não mude de número após reinicialização.
Para CSI: `type: libcamera` e `libcamera.exposure_us`/`analogue_gain`/`colour_gains` fixos.

## Teste

```bash
.venv/bin/python scripts/run_inspection.py --once --lot TESTE
.venv/bin/python scripts/benchmark_model.py --models models/registry/<id>/<arquivo>.onnx --iterations 300
.venv/bin/python scripts/benchmark_model.py --models models/registry/<id>/<arquivo>.onnx --duration 1800
```

`<id>`/`<arquivo>`: mostrados por `manage_models.py list` (ex.: `caps-v1-640/best_640_fp32.onnx`).

## Serviço

```bash
bash scripts/setup_raspberry_pi.sh --install-service
sudo systemctl start capsule-inspector capsule-inspector-ui
systemctl status capsule-inspector
journalctl -u capsule-inspector -f
```

O serviço de inspeção e a interface são processos separados: se a interface cair, a inspeção
continua. Parada: `sudo systemctl stop capsule-inspector` (SIGTERM; termina a inspeção corrente).
**Procedimento de interrupção em caso de falha**: pare o serviço, segregue o material inspecionado
desde o último resultado confiável (consulte `var/inspections.sqlite3` pelo horário) e registre o
evento; o atuador de rejeição, quando habilitado, rejeita tudo que não for PASS.

## Acesso remoto

Por padrão a interface escuta só em `127.0.0.1:8080`. Prefira túnel SSH:
`ssh -L 8080:127.0.0.1:8080 operador@raspberrypi.local`. Para escutar na rede local altere
`interface.host` em `configs/system.yaml` **e** defina `CAPSULE_UI_TOKEN` (o serviço recusa iniciar
sem token). Nunca exponha o Pi à internet.

## Atualização de modelo e rollback

Ver README, passo 13. O serviço nunca troca de modelo sozinho: `active.json` só muda por
`manage_models.py activate|rollback`, com responsável registrado.
