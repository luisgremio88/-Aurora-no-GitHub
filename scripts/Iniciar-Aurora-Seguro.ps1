param(
  [switch]$OpenBrowser,
  [switch]$NoStart,
  [switch]$StartComfyUI
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SecretDir = Join-Path $ProjectRoot "data\secrets"
$SettingsPath = Join-Path $SecretDir "ai-settings.json"

function ConvertTo-PlainText {
  param([securestring]$SecureValue)
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Read-AuroraSecret {
  param([string]$Name)
  $secretPath = Join-Path $SecretDir "$Name.secret"
  if (-not (Test-Path -LiteralPath $secretPath)) {
    return ""
  }
  $encrypted = (Get-Content -LiteralPath $secretPath -Raw).Trim()
  $secure = $encrypted | ConvertTo-SecureString
  ConvertTo-PlainText $secure
}

if (Test-Path -LiteralPath $SettingsPath) {
  $settings = Get-Content -LiteralPath $SettingsPath -Raw | ConvertFrom-Json
  $env:AURORA_AI_PROVIDER = if ($settings.provider) { $settings.provider } else { "auto" }
  $env:GEMINI_MODEL = if ($settings.geminiModel) { $settings.geminiModel } else { "gemini-2.5-flash" }
  $env:OPENROUTER_MODEL = if ($settings.openRouterModel) { $settings.openRouterModel } else { "openrouter/auto" }
} else {
  $env:AURORA_AI_PROVIDER = "auto"
  $env:GEMINI_MODEL = "gemini-2.5-flash"
  $env:OPENROUTER_MODEL = "openrouter/auto"
}

$env:GEMINI_API_KEY = Read-AuroraSecret "gemini_api_key"
$env:OPENROUTER_API_KEY = Read-AuroraSecret "openrouter_api_key"
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue

if ($NoStart) {
  Write-Host "Segredos carregados para esta sessao."
  return
}

Set-Location $ProjectRoot
if ($StartComfyUI) {
  try {
    & (Join-Path $PSScriptRoot "Iniciar-ComfyUI-Aurora.ps1") -Quiet
  } catch {
    Write-Host "ComfyUI nao iniciou: $($_.Exception.Message)"
  }
}

Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $ProjectRoot -WindowStyle Hidden | Out-Null
Start-Sleep -Seconds 2

if ($OpenBrowser) {
  Start-Process "http://localhost:3123"
}

Write-Host "Aurora Local iniciada com segredos carregados em memoria."
