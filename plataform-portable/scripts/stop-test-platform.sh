#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.test-runtime"
PID_FILE="$RUNTIME_DIR/server.pid"
PORT_FILE="$RUNTIME_DIR/server.port"
MODE_FILE="$RUNTIME_DIR/server.mode"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No hay una plataforma portable en ejecucion."
  exit 0
fi

PID="$(cat "$PID_FILE")"
PORT="$(cat "$PORT_FILE" 2>/dev/null || true)"

if kill -0 "$PID" >/dev/null 2>&1; then
  kill "$PID"
  echo "Plataforma portable detenida (PID: $PID${PORT:+, puerto: $PORT})."
else
  echo "El proceso ya no estaba activo."
fi

rm -f "$PID_FILE" "$PORT_FILE"
rm -f "$MODE_FILE"
