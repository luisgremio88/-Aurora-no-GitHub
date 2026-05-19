param(
  [switch]$SkipPythonPackages
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ToolsRoot = if ($env:AURORA_TOOLS_DIR) { $env:AURORA_TOOLS_DIR } else { "C:\AuroraTools" }
$ComfyRoot = Join-Path $ToolsRoot "ComfyUI"
$ZipPath = Join-Path $ToolsRoot "ComfyUI-master.zip"
$DownloadUrl = "https://github.com/Comfy-Org/ComfyUI/archive/refs/heads/master.zip"

New-Item -ItemType Directory -Force -Path $ToolsRoot | Out-Null

function Invoke-Step {
  param(
    [string]$Title,
    [scriptblock]$Block
  )
  Write-Host ""
  Write-Host "== $Title =="
  & $Block
}

Invoke-Step "Verificando Python" {
  $python = Get-Command python -ErrorAction Stop
  $version = & $python.Source --version
  Write-Host $version
  if ($version -match "Python 3\.13") {
    Write-Host "Aviso: ComfyUI costuma ser mais previsivel com Python 3.10-3.12. Vou preparar mesmo assim."
  }
}

Invoke-Step "Baixando ComfyUI" {
  if (Test-Path -LiteralPath $ComfyRoot) {
    Write-Host "ComfyUI ja existe em $ComfyRoot. Nao vou sobrescrever."
    return
  }
  if (-not (Test-Path -LiteralPath $ZipPath)) {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
  }
  $ExtractRoot = Join-Path $ToolsRoot "ComfyUI-extract"
  if (Test-Path -LiteralPath $ExtractRoot) {
    throw "A pasta temporaria $ExtractRoot ja existe. Remova manualmente se for seguro e rode novamente."
  }
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractRoot
  $Extracted = Get-ChildItem -LiteralPath $ExtractRoot -Directory | Select-Object -First 1
  if (-not $Extracted) {
    throw "Nao encontrei a pasta extraida do ComfyUI."
  }
  Move-Item -LiteralPath $Extracted.FullName -Destination $ComfyRoot
  Remove-Item -LiteralPath $ExtractRoot -Force
  Write-Host "ComfyUI preparado em $ComfyRoot"
}

Invoke-Step "Criando ambiente Python" {
  $VenvPython = Join-Path $ComfyRoot ".venv\Scripts\python.exe"
  if (-not (Test-Path -LiteralPath $VenvPython)) {
    python -m venv (Join-Path $ComfyRoot ".venv")
  }
  & $VenvPython --version
}

if (-not $SkipPythonPackages) {
  Invoke-Step "Instalando pacotes Python" {
    $VenvPython = Join-Path $ComfyRoot ".venv\Scripts\python.exe"
    & $VenvPython -m pip install --upgrade pip
    & $VenvPython -m pip install --no-cache-dir --force-reinstall --no-deps torch==2.11.0+cu128 torchvision==0.26.0+cu128 torchaudio==2.11.0+cu128 --index-url https://download.pytorch.org/whl/cu128
    & $VenvPython -m pip install --no-cache-dir -r (Join-Path $ComfyRoot "requirements.txt")
    & $VenvPython -m pip check
  }
} else {
  Write-Host ""
  Write-Host "Pacotes Python pulados por -SkipPythonPackages."
}

Write-Host ""
Write-Host "Instalacao base concluida."
Write-Host "Coloque um modelo .safetensors em:"
Write-Host "  $ComfyRoot\models\checkpoints"
Write-Host "Depois rode:"
Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Iniciar-ComfyUI-Aurora.ps1"
