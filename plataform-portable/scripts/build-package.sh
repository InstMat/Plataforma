#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
STAMP="$(date +%Y%m%d-%H%M%S)"
PKG_NAME="plataform-portable-${STAMP}"

mkdir -p "$DIST_DIR"

(
  cd "$ROOT_DIR"
  zip -rq "$DIST_DIR/$PKG_NAME.zip" . \
    -x "./dist/*" \
       "./.test-runtime/*" \
       "./reveal/node_modules/*" \
       "./reveal/.git/*"
)

echo "Paquete portable creado en: $DIST_DIR/$PKG_NAME.zip"
