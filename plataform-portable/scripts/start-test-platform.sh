#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.test-runtime"
PID_FILE="$RUNTIME_DIR/server.pid"
PORT_FILE="$RUNTIME_DIR/server.port"
LOG_FILE="$RUNTIME_DIR/server.log"
MODE_FILE="$RUNTIME_DIR/server.mode"

mkdir -p "$RUNTIME_DIR"

find_free_port() {
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
    return
  fi

  if command -v python >/dev/null 2>&1; then
    python - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
    return
  fi

  echo 8000
}

open_browser() {
  local url="$1"

  if [[ -n "${BROWSER:-}" ]]; then
    "$BROWSER" "$url" >/dev/null 2>&1 && return 0
  fi

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 && return 0
  elif command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 && return 0
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "Start-Process '$url'" >/dev/null 2>&1 && return 0
  fi

  return 1
}

start_server() {
  local port="$1"

  if command -v python3 >/dev/null 2>&1; then
    nohup python3 -m http.server "$port" --bind 127.0.0.1 --directory "$ROOT_DIR" >"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "python3" > "$MODE_FILE"
    return 0
  fi

  if command -v python >/dev/null 2>&1; then
    if python - <<'PY' >/dev/null 2>&1
import http.server
PY
    then
      nohup python -m http.server "$port" --bind 127.0.0.1 --directory "$ROOT_DIR" >"$LOG_FILE" 2>&1 &
    else
      nohup python -m SimpleHTTPServer "$port" >"$LOG_FILE" 2>&1 &
    fi
    echo $! > "$PID_FILE"
    echo "python" > "$MODE_FILE"
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    nohup node -e "
const http=require('http');
const fs=require('fs');
const path=require('path');
const root=process.argv[1];
const port=Number(process.argv[2]);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.eot':'application/vnd.ms-fontobject','.map':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
  let p=decodeURIComponent((req.url||'/').split('?')[0]);
  if(p==='/'||p==='') p='/index.html';
  const fp=path.normalize(path.join(root,p));
  if(!fp.startsWith(path.normalize(root+path.sep))){res.statusCode=403;res.end('Forbidden');return;}
  fs.stat(fp,(e,s)=>{
    if(e){res.statusCode=404;res.end('Not found');return;}
    const f=s.isDirectory()?path.join(fp,'index.html'):fp;
    fs.readFile(f,(er,d)=>{
      if(er){res.statusCode=404;res.end('Not found');return;}
      const ext=path.extname(f).toLowerCase();
      res.setHeader('Content-Type', mime[ext]||'application/octet-stream');
      res.end(d);
    });
  });
}).listen(port,'127.0.0.1');
" "$ROOT_DIR" "$port" >"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "node" > "$MODE_FILE"
    return 0
  fi

  if command -v php >/dev/null 2>&1; then
    nohup php -S "127.0.0.1:${port}" -t "$ROOT_DIR" >"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "php" > "$MODE_FILE"
    return 0
  fi

  if command -v ruby >/dev/null 2>&1; then
    nohup ruby -run -e httpd "$ROOT_DIR" -p "$port" -b 127.0.0.1 >"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "ruby" > "$MODE_FILE"
    return 0
  fi

  if command -v powershell.exe >/dev/null 2>&1; then
    local win_root
    win_root="$(wslpath -w "$ROOT_DIR")"
    nohup powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${win_root}\\scripts\\start-test-platform.ps1" -Port "$port" -NoBrowser >"$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "powershell.exe" > "$MODE_FILE"
    return 0
  fi

  return 1
}

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if kill -0 "$EXISTING_PID" >/dev/null 2>&1; then
    EXISTING_PORT="$(cat "$PORT_FILE" 2>/dev/null || true)"
    EXISTING_PORT="${EXISTING_PORT:-8000}"
    URL="http://127.0.0.1:${EXISTING_PORT}/index.html"
    echo "La plataforma portable ya esta en ejecucion: $URL"
    open_browser "$URL" || true
    exit 0
  else
    rm -f "$PID_FILE" "$PORT_FILE" "$MODE_FILE"
  fi
fi

PORT="${PORT:-$(find_free_port)}"

if ! start_server "$PORT"; then
  echo "No se encontro runtime para servidor local (python/node/php/ruby/powershell)." >&2
  echo "Puedes abrir index.html directamente, pero muchos navegadores bloquearan JSON por seguridad." >&2
  exit 1
fi

echo "$PORT" > "$PORT_FILE"

URL="http://127.0.0.1:${PORT}/index.html"
echo "Plataforma portable iniciada en: $URL"
echo "Para detener: bash scripts/stop-test-platform.sh"

open_browser "$URL" || echo "No se pudo abrir el navegador automaticamente. Abre: $URL"
