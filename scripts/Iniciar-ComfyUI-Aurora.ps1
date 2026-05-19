param(
  [int]$Port = 8188,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ToolsRoot = if ($env:AURORA_TOOLS_DIR) { $env:AURORA_TOOLS_DIR } else { "C:\AuroraTools" }
$ComfyRoot = Join-Path $ToolsRoot "ComfyUI"
$VenvPython = Join-Path $ComfyRoot ".venv\Scripts\python.exe"

function Test-PortOpen {
  param([int]$Port)
  $client = [Net.Sockets.TcpClient]::new()
  try {
    $async = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(500)) {
      return $false
    }
    $client.EndConnect($async)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

if (-not (Test-Path -LiteralPath $ComfyRoot)) {
  throw "ComfyUI nao encontrado. Rode scripts\Instalar-ComfyUI-Aurora.ps1 primeiro."
}

if (-not (Test-Path -LiteralPath $VenvPython)) {
  throw "Ambiente Python do ComfyUI nao encontrado. Rode scripts\Instalar-ComfyUI-Aurora.ps1 primeiro."
}

$env:COMFYUI_URL = "http://127.0.0.1:$Port"
if (Test-PortOpen -Port $Port) {
  if (-not $Quiet) {
    Write-Host "ComfyUI ja esta respondendo em http://127.0.0.1:$Port"
  }
  return
}

Start-Process -FilePath $VenvPython -ArgumentList @("main.py", "--listen", "127.0.0.1", "--port", "$Port") -WorkingDirectory $ComfyRoot -WindowStyle Hidden | Out-Null
if (-not $Quiet) {
  Write-Host "ComfyUI iniciando em http://127.0.0.1:$Port"
}
