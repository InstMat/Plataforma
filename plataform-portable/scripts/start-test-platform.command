#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
bash scripts/start-test-platform.sh
