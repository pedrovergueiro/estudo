#!/usr/bin/env bash
# Instalador OFFLINE do Capsule Inspector para Raspberry Pi (Raspberry Pi OS 64 bits).
# Não usa internet, pip nem venv: as dependências já vêm dentro do pacote.
#
#   ./instalar.sh                    # instala em ~/capsule-inspector e roda o autoteste
#   ./instalar.sh --servico          # + inicia sozinho ao ligar (câmera + interface na rede)
#   ./instalar.sh --destino /opt/capsule-inspector
set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESTINO="$HOME/capsule-inspector"
SERVICO=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --servico) SERVICO=1 ;;
    --destino) DESTINO="$2"; shift ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "opção desconhecida: $1" >&2; exit 2 ;;
  esac
  shift
done

ARCH_PACOTE="$(cat "$AQUI/ARQUITETURA")"
erro() { echo; echo "ERRO: $*" >&2; exit 1; }

echo "== Capsule Inspector — instalação offline"
MAQ="$(uname -m)"
MODELO="$(tr -d '\0' < /proc/device-tree/model 2>/dev/null || echo 'não identificado')"
echo "   Aparelho: $MODELO | kernel: $MAQ"

command -v python3 >/dev/null || erro "python3 não encontrado. O Raspberry Pi OS já traz o Python; reinstale o sistema ou instale python3."
read -r PYV PYBITS PYMACH < <(python3 -c 'import sys,struct,platform;print(f"{sys.version_info[0]}.{sys.version_info[1]}", struct.calcsize("P")*8, platform.machine())')
echo "   Python: $PYV ($PYBITS bits, $PYMACH)"

if [[ "$PYBITS" != "64" || ( "$ARCH_PACOTE" == "aarch64" && "$PYMACH" != "aarch64" ) ]]; then
  if [[ "$PYMACH" == armv* || "$PYBITS" == "32" ]]; then
    erro "este Raspberry Pi está com sistema de 32 bits. É preciso o Raspberry Pi OS (64-bit).
       Grave o cartão com o Raspberry Pi Imager escolhendo 'Raspberry Pi OS (64-bit)'.
       Modelos compatíveis: Pi 3B/3B+, Pi 4, Pi 400, Pi 5, Zero 2 W, CM4/CM5."
  fi
  erro "pacote feito para $ARCH_PACOTE, mas este sistema é $PYMACH."
fi

case "$PYV" in
  3.11) TAG=cp311 ;;
  3.13) TAG=cp313 ;;
  *) erro "Python $PYV não suportado por este pacote (suportados: 3.11 = Raspberry Pi OS Bookworm, 3.13 = Trixie)." ;;
esac
[[ -d "$AQUI/rodas/$TAG" ]] || erro "dependências para $TAG ausentes no pacote."

echo "== Verificando integridade do pacote"
if command -v sha256sum >/dev/null; then
  (cd "$AQUI" && sha256sum --quiet -c SHA256SUMS) || erro "arquivos do pacote corrompidos (baixe de novo)."
  echo "   ok"
fi

RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
LIVRE_GB=$(df -Pk "$HOME" | awk 'NR==2 {print int($4/1024/1024)}')
echo "   RAM: ${RAM_MB} MB | disco livre: ${LIVRE_GB} GB"
if [[ "$RAM_MB" -lt 900 ]]; then echo "   AVISO: menos de 1 GB de RAM — pode funcionar devagar (modelo usa ~250 MB)."; fi
if [[ "$LIVRE_GB" -lt 2 ]]; then erro "menos de 2 GB livres no disco."; fi

echo "== Instalando em $DESTINO"
if [[ -d "$DESTINO/app/var" ]]; then
  echo "   instalação anterior encontrada: resultados em var/ serão mantidos"
  mv "$DESTINO/app/var" "$AQUI/.var_preservado"
fi
rm -rf "$DESTINO"
mkdir -p "$DESTINO"
cp -a "$AQUI/app" "$DESTINO/app"
if [[ -d "$AQUI/.var_preservado" ]]; then mv "$AQUI/.var_preservado" "$DESTINO/app/var"; fi
{ python3 "$AQUI/install_wheels.py" "$AQUI/rodas/comum" "$DESTINO/lib" && \
  python3 "$AQUI/install_wheels.py" "$AQUI/rodas/$TAG" "$DESTINO/lib"; } > "$DESTINO/instalacao.log" \
  || erro "falha ao instalar dependências (veja $DESTINO/instalacao.log)"
echo "   dependências instaladas ($(ls "$AQUI/rodas/comum" "$AQUI/rodas/$TAG" | grep -c '\.whl$') pacotes)"

mkdir -p "$DESTINO/bin"
cat > "$DESTINO/bin/capsule-inspector" <<EOF
#!/usr/bin/env bash
# Gerado por instalar.sh — usa só as bibliotecas do pacote (sem internet).
export PYTHONPATH="$DESTINO/lib:$DESTINO/app/src"
export PYTHONNOUSERSITE=1
export CAPSULE_INSPECTOR_ROOT="$DESTINO/app"
export CAPSULE_CONFIG_OVERLAY="configs/examples/pi_bundle"
export OMP_NUM_THREADS=\${OMP_NUM_THREADS:-4}
cd "$DESTINO/app"
exec python3 -m capsule_inspector.cli "\$@"
EOF
chmod +x "$DESTINO/bin/capsule-inspector"
mkdir -p "$HOME/.local/bin"
ln -sf "$DESTINO/bin/capsule-inspector" "$HOME/.local/bin/capsule-inspector"

if ! groups | grep -qw video; then
  echo "   AVISO: usuário fora do grupo 'video' (câmera). Rode: sudo usermod -aG video $USER  e reinicie."
fi

echo "== Autoteste (imagens de exemplo)"
"$DESTINO/bin/capsule-inspector" teste || erro "autoteste falhou — veja acima e $DESTINO/app/var/logs/"

if [[ $SERVICO -eq 1 ]]; then
  echo "== Instalando serviço (pede a senha do sudo)"
  sudo tee /etc/systemd/system/capsule-inspector.service > /dev/null <<EOF
[Unit]
Description=Capsule Inspector (câmera + interface)
After=network.target

[Service]
Type=simple
User=$USER
SupplementaryGroups=video
ExecStart=$DESTINO/bin/capsule-inspector iniciar --rede
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
  sudo systemctl daemon-reload
  sudo systemctl enable --now capsule-inspector.service
  echo "   serviço ativo: systemctl status capsule-inspector"
fi

echo
echo "Instalado. Comandos (se 'capsule-inspector' não for achado, abra um novo terminal ou use $DESTINO/bin/capsule-inspector):"
echo "   capsule-inspector pasta ~/minhas_imagens     # analisa uma pasta"
echo "   capsule-inspector iniciar                    # câmera + interface (http://127.0.0.1:8080)"
echo "   capsule-inspector iniciar --rede             # interface acessível de outro computador"
echo "   capsule-inspector diagnostico                # modelo do Pi, câmeras, temperatura"
