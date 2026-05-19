$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "Aurora Local.lnk"
$Target = Join-Path $ProjectRoot "Aurora Desktop.bat"

if (-not (Test-Path -LiteralPath $Target)) {
  throw "Arquivo nao encontrado: $Target"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $Target
$shortcut.WorkingDirectory = $ProjectRoot
$shortcut.WindowStyle = 1
$shortcut.Description = "Abrir Aurora Local em modo aplicativo"
$shortcut.Save()

Write-Host "Atalho criado em: $ShortcutPath"
