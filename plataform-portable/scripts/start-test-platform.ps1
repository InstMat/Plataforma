param(
  [int]$Port = 0,
  [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Runtime = Join-Path $Root ".test-runtime"
$PidFile = Join-Path $Runtime "server.pid"
$PortFile = Join-Path $Runtime "server.port"
$LogFile = Join-Path $Runtime "server.log"

New-Item -ItemType Directory -Force -Path $Runtime | Out-Null

function Get-FreePort {
  $l = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
  $l.Start()
  $p = ($l.LocalEndpoint).Port
  $l.Stop()
  return $p
}

if (Test-Path $PidFile) {
  $Existing = Get-Content $PidFile -ErrorAction SilentlyContinue
  if ($Existing) {
    $proc = Get-Process -Id $Existing -ErrorAction SilentlyContinue
    if ($proc) {
      $CurrentPort = if (Test-Path $PortFile) { Get-Content $PortFile } else { "8000" }
      $Url = "http://127.0.0.1:$CurrentPort/index.html"
      Write-Host "La plataforma portable ya esta en ejecucion: $Url"
      if (-not $NoBrowser) { Start-Process $Url }
      exit 0
    }
  }
}

if ($Port -le 0) { $Port = Get-FreePort }

$prefix = "http://127.0.0.1:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

$PID | Set-Content $PidFile
$Port | Set-Content $PortFile

$Url = "http://127.0.0.1:$Port/index.html"
Write-Host "Plataforma portable iniciada en: $Url"
Write-Host "Para detener: powershell -ExecutionPolicy Bypass -File scripts/stop-test-platform.ps1"
if (-not $NoBrowser) { Start-Process $Url }

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $rel = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

    $target = [IO.Path]::GetFullPath((Join-Path $Root $rel))
    $rootFull = [IO.Path]::GetFullPath($Root)

    if (-not $target.StartsWith($rootFull)) {
      $response.StatusCode = 403
      $bytes = [Text.Encoding]::UTF8.GetBytes("Forbidden")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    if ((Test-Path $target) -and (Get-Item $target).PSIsContainer) {
      $target = Join-Path $target "index.html"
    }

    if (-not (Test-Path $target)) {
      $response.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    $ext = [IO.Path]::GetExtension($target).ToLowerInvariant()
    $mime = switch ($ext) {
      ".html" { "text/html; charset=utf-8" }
      ".css"  { "text/css; charset=utf-8" }
      ".js"   { "application/javascript; charset=utf-8" }
      ".json" { "application/json; charset=utf-8" }
      ".png"  { "image/png" }
      ".jpg"  { "image/jpeg" }
      ".jpeg" { "image/jpeg" }
      ".gif"  { "image/gif" }
      ".svg"  { "image/svg+xml" }
      ".ico"  { "image/x-icon" }
      ".woff" { "font/woff" }
      ".woff2"{ "font/woff2" }
      ".ttf"  { "font/ttf" }
      ".eot"  { "application/vnd.ms-fontobject" }
      ".map"  { "application/json; charset=utf-8" }
      default  { "application/octet-stream" }
    }

    $buffer = [IO.File]::ReadAllBytes($target)
    $response.ContentType = $mime
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
  } catch {
    Add-Content -Path $LogFile -Value $_.Exception.Message
  }
}
