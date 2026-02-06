#!/bin/bash
# Script para ejecutar DIRECTAMENTE en el servidor Ubuntu
# Configura redirección NAT: puerto 80 -> 3000

set -euo pipefail

SERVER_PORT=${1:-3000}

echo "Configurando redirección 80 -> $SERVER_PORT..."

run_sudo() { 
    sudo "$@"
}

export DEBIAN_FRONTEND=noninteractive
echo "Actualitzant repositoris..."
run_sudo apt-get update -qq
echo "Instal·lant iptables-persistent..."
run_sudo apt-get install -y iptables-persistent

# Comprobar si ya existe la regla (idempotente)
if run_sudo iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports $SERVER_PORT 2>/dev/null; then
    echo "✓ Ya existe la redirecció 80 -> $SERVER_PORT"
else
    echo "Afegint redirecció 80 -> $SERVER_PORT..."
    run_sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports $SERVER_PORT
fi

# Persistir las reglas
TMP=$(mktemp)
run_sudo iptables-save > "$TMP"
run_sudo install -m 600 "$TMP" /etc/iptables/rules.v4
rm -f "$TMP"

# Reiniciar servicio si existe
command -v systemctl >/dev/null 2>&1 && run_sudo systemctl restart netfilter-persistent || true

echo "✔ Redirecció 80 -> $SERVER_PORT configurada i persistida."
echo ""
echo "Verifica amb: sudo iptables -t nat -L PREROUTING -n -v"
