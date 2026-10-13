#!/usr/bin/env bash
# Prepara o Raspberry Pi (Raspberry Pi OS 64 bits, Bookworm ou Trixie) para o runtime
# de inspeção. Execute DENTRO do diretório do projeto já copiado para o Pi:
#
#   cd ~/capsule_inspector
#   bash scripts/setup_raspberry_pi.sh                 # câmera USB (recomendado)
#   bash scripts/setup_raspberry_pi.sh --with-picamera # câmera CSI via libcamera/Picamera2
#   bash scripts/setup_raspberry_pi.sh --install-service
#
# O que faz: verifica arquitetura/SO, instala pacotes apt, cria .venv, instala
# requirements/raspberry_pi.txt, roda os testes unitários e (opcional) instala os
# serviços systemd gerados a partir de deploy/systemd/*.service.in.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_USER="$(id -un)"
WITH_PICAMERA=0
INSTALL_SERVICE=0
for arg in "$@"; do
  case "$arg" in
    --with-picamera) WITH_PICAMERA=1 ;;
    --install-service) INSTALL_SERVICE=1 ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "argumento desconhecido: $arg" >&2; exit 2 ;;
  esac
done

echo "== Projeto: $APP_DIR  (usuário: $APP_USER)"
ARCH="$(uname -m)"
if [[ "$ARCH" != "aarch64" ]]; then
  echo "ERRO: arquitetura $ARCH. Use Raspberry Pi OS 64 bits (aarch64): ONNX Runtime não publica rodas armv7." >&2
  exit 1
fi
. /etc/os-release
echo "== SO: $PRETTY_NAME"
MODEL="$(tr -d '\0' < /proc/device-tree/model 2>/dev/null || echo desconhecido)"
echo "== Hardware: $MODEL"
case "$MODEL" in
  *"Raspberry Pi 5"*) echo "   referência suportada" ;;
  *"Raspberry Pi 4"*) echo "   configuração secundária: valide latência com scripts/benchmark_model.py" ;;
  *) echo "   AVISO: modelo não testado" ;;
esac

PKGS=(python3-venv python3-dev v4l-utils sqlite3)
[[ $WITH_PICAMERA -eq 1 ]] && PKGS+=(python3-picamera2)
PKGS+=(python3-gpiozero)   # só é usado se o atuador/gatilho GPIO for habilitado
echo "== apt: ${PKGS[*]}"
sudo apt-get update
sudo apt-get install -y "${PKGS[@]}"

PY=python3
VENV_FLAGS=()
if [[ $WITH_PICAMERA -eq 1 ]]; then
  # Picamera2 vem do apt; o venv precisa enxergar os pacotes do sistema.
  VENV_FLAGS+=(--system-site-packages)
fi
if [[ ! -d "$APP_DIR/.venv" ]]; then
  "$PY" -m venv "${VENV_FLAGS[@]}" "$APP_DIR/.venv"
fi
"$APP_DIR/.venv/bin/pip" install --upgrade pip
"$APP_DIR/.venv/bin/pip" install -r "$APP_DIR/requirements/raspberry_pi.txt"
"$APP_DIR/.venv/bin/pip" install -e "$APP_DIR" --no-deps
"$APP_DIR/.venv/bin/pip" install pytest==9.1.1 httpx==0.28.1

if [[ $WITH_PICAMERA -eq 1 ]]; then
  echo "== verificando Picamera2 + numpy do venv"
  if ! "$APP_DIR/.venv/bin/python" -c "import picamera2, numpy; print('picamera2 ok, numpy', numpy.__version__)"; then
    cat >&2 <<'MSG'
AVISO: Picamera2 (apt) não importou com o numpy do venv. No Bookworm, o numpy do apt
é 1.x e módulos compilados (simplejpeg) podem ser incompatíveis com numpy 2.x do pip.
Opções: (1) usar câmera USB/UVC (padrão recomendado); (2) Raspberry Pi OS Trixie;
(3) ver docs/TROUBLESHOOTING.md, seção "Picamera2 e numpy".
MSG
  fi
fi

echo "== relatório da plataforma"
"$APP_DIR/.venv/bin/python" "$APP_DIR/scripts/system_report.py" --out "$APP_DIR/reports/platform_$(hostname).json" | head -30

echo "== testes unitários (sem PyTorch)"
"$APP_DIR/.venv/bin/python" -m pytest "$APP_DIR/tests/unit" -q

mkdir -p "$APP_DIR/var/logs"
if [[ $INSTALL_SERVICE -eq 1 ]]; then
  for unit in capsule-inspector capsule-inspector-ui; do
    sed -e "s|@APP_DIR@|$APP_DIR|g" -e "s|@APP_USER@|$APP_USER|g" \
      "$APP_DIR/deploy/systemd/$unit.service.in" | sudo tee "/etc/systemd/system/$unit.service" > /dev/null
  done
  sudo usermod -aG video,gpio "$APP_USER" || true
  sudo systemctl daemon-reload
  sudo systemctl enable capsule-inspector.service capsule-inspector-ui.service
  echo "Serviços instalados. Inicie com: sudo systemctl start capsule-inspector capsule-inspector-ui"
fi
echo "== concluído"
