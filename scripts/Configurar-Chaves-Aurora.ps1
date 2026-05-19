param(
  [switch]$FromEnvironment
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SecretDir = Join-Path $ProjectRoot "data\secrets"
$SettingsPath = Join-Path $SecretDir "ai-settings.json"

New-Item -ItemType Directory -Force -Path $SecretDir | Out-Null

function ConvertTo-PlainText {
  param([securestring]$SecureValue)
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Save-AuroraSecret {
  param(
    [string]$Name,
    [string]$EnvName,
    [string]$Prompt
  )

  $secureValue = $null
  if ($FromEnvironment) {
    $plainFromUser = [Environment]::GetEnvironmentVariable($EnvName, "User")
    $plainFromProcess = [Environment]::GetEnvironmentVariable($EnvName, "Process")
    $plain = if ($plainFromUser) { $plainFromUser } else { $plainFromProcess }
    if ($plain) {
      $secureValue = ConvertTo-SecureString $plain -AsPlainText -Force
    }
  }

  if (-not $secureValue) {
    $secureValue = Read-Host $Prompt -AsSecureString
  }

  $plainValue = ConvertTo-PlainText $secureValue
  if ([string]::IsNullOrWhiteSpace($plainValue)) {
    Write-Host "$Name ignorada."
    return
  }

  $secretPath = Join-Path $SecretDir "$Name.secret"
  $secureValue | ConvertFrom-SecureString | Set-Content -LiteralPath $secretPath -Encoding UTF8
  Write-Host "$Name salva com protecao DPAPI do usuario atual."
}

Save-AuroraSecret -Name "gemini_api_key" -EnvName "GEMINI_API_KEY" -Prompt "Cole a chave Gemini"
Save-AuroraSecret -Name "openrouter_api_key" -EnvName "OPENROUTER_API_KEY" -Prompt "Cole a chave OpenRouter"

$settings = [ordered]@{
  provider = "auto"
  geminiModel = "gemini-2.5-flash"
  openRouterModel = "openrouter/auto"
  updatedAt = (Get-Date).ToString("o")
}

$settings | ConvertTo-Json | Set-Content -LiteralPath $SettingsPath -Encoding UTF8

Write-Host "Configuracao segura concluida em data\secrets."
Write-Host "As chaves nao foram salvas em texto puro."
