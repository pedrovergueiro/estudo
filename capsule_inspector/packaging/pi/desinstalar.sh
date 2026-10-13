#!/usr/bin/env bash
# Remove o Capsule Inspector. Use --manter-resultados para guardar var/ (banco e imagens).
set -euo pipefail
DESTINO="${DESTINO:-$HOME/capsule-inspector}"
if systemctl list-unit-files 2>/dev/null | grep -q '^capsule-inspector.service'; then
  sudo systemctl disable --now capsule-inspector.service || true
  sudo rm -f /etc/systemd/system/capsule-inspector.service
  sudo systemctl daemon-reload
fi
if [[ "${1:-}" == "--manter-resultados" && -d "$DESTINO/app/var" ]]; then
  mv "$DESTINO/app/var" "$HOME/capsule-inspector-resultados-$(date +%Y%m%d%H%M%S)"
  echo "resultados guardados em $HOME/capsule-inspector-resultados-*"
fi
rm -rf "$DESTINO"
rm -f "$HOME/.local/bin/capsule-inspector"
echo "removido."
