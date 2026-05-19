param(
  [string]$ToolsDir = "C:\AuroraTools\aurora-node-tools"
)

$ErrorActionPreference = "Stop"

Write-Host "Preparando ferramentas externas da Aurora em: $ToolsDir"
New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

Push-Location $ToolsDir
try {
  if (!(Test-Path ".\package.json")) {
    npm init -y | Out-Host
  }

  npm install `
    playwright `
    "@playwright/test" `
    execa `
    simple-git `
    fast-glob `
    ignore `
    zod `
    prisma `
    chokidar `
    exceljs `
    docx `
    vite `
    phaser `
    three `
    typescript `
    eslint `
    vitest `
    tsx

  Write-Host ""
  Write-Host "Ferramentas externas instaladas."
  Write-Host "A Aurora detecta automaticamente essa pasta pelo caminho padrao."
  Write-Host "Se usar outro caminho, defina AURORA_NODE_TOOLS_DIR antes de iniciar a Aurora."
} finally {
  Pop-Location
}
