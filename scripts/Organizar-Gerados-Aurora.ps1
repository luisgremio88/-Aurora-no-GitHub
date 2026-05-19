param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$GeneratedRoot = Join-Path $ProjectRoot "generated"
$ArchiveRoot = Join-Path $GeneratedRoot "_archive"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$TargetRoot = Join-Path $ArchiveRoot $Stamp

if (-not (Test-Path -LiteralPath $GeneratedRoot)) {
  Write-Host "Pasta generated nao existe."
  return
}

$patterns = @(
  "smoke-document.md",
  "smoke-document.md.*.bak",
  "smoke-attached-edit-*.md"
)

$files = foreach ($pattern in $patterns) {
  Get-ChildItem -LiteralPath $GeneratedRoot -File -Filter $pattern -ErrorAction SilentlyContinue
}

if (-not $files) {
  Write-Host "Nenhum artefato de teste para arquivar."
  return
}

Write-Host "Arquivos de teste encontrados:"
$files | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize

if (-not $Apply) {
  Write-Host ""
  Write-Host "Nada foi movido. Rode com -Apply para arquivar em generated\_archive."
  return
}

New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null
foreach ($file in $files) {
  Move-Item -LiteralPath $file.FullName -Destination (Join-Path $TargetRoot $file.Name)
}

Write-Host "Arquivado em: $TargetRoot"
