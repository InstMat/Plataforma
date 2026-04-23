$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Runtime = Join-Path $Root ".test-runtime"
$PidFile = Join-Path $Runtime "server.pid"
$PortFile = Join-Path $Runtime "server.port"

if (-not (Test-Path $PidFile)) {
  Write-Host "No hay una plataforma portable en ejecucion."
  exit 0
}

$PidValue = Get-Content $PidFile -ErrorAction SilentlyContinue
$Port = if (Test-Path $PortFile) { Get-Content $PortFile } else { "" }

if ($PidValue) {
  $proc = Get-Process -Id $PidValue -ErrorAction SilentlyContinue
  if ($proc) {
    Stop-Process -Id $PidValue -Force
    if ($Port) {
      Write-Host "Plataforma portable detenida (PID: $PidValue, puerto: $Port)."
    } else {
      Write-Host "Plataforma portable detenida (PID: $PidValue)."
    }
  } else {
    Write-Host "El proceso ya no estaba activo."
  }
}

Remove-Item -Force -ErrorAction SilentlyContinue $PidFile, $PortFile
