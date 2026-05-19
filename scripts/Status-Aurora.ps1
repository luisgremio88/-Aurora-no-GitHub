$ErrorActionPreference = "SilentlyContinue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ComfyRoot = $env:AURORA_COMFYUI_DIR
if (-not $ComfyRoot) {
  $ComfyRoot = "C:\AuroraTools\ComfyUI"
}

function Get-PortStatus {
  param([int]$Port)
  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $connection) {
    return [pscustomobject]@{ Port = $Port; Online = $false; ProcessId = ""; ProcessName = ""; Path = "" }
  }
  $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
  [pscustomobject]@{
    Port = $Port
    Online = $true
    ProcessId = $connection.OwningProcess
    ProcessName = $process.ProcessName
    Path = $process.Path
  }
}

function Get-CommandStatus {
  param([string]$Name, [string[]]$ToolArgs = @("--version"))
  try {
    $output = & $Name @ToolArgs 2>&1 | Select-Object -First 1
    [pscustomobject]@{ Tool = $Name; Available = $true; Version = "$output" }
  } catch {
    [pscustomobject]@{ Tool = $Name; Available = $false; Version = $_.Exception.Message }
  }
}

Write-Host "Aurora Local - Status"
Write-Host ""
Write-Host "Projeto: $ProjectRoot"
Write-Host "ComfyUI: $ComfyRoot"
Write-Host ""

Write-Host "Portas"
Get-PortStatus 3123 | Format-List
Get-PortStatus 8188 | Format-List

Write-Host "Ferramentas"
Get-CommandStatus -Name "node" -ToolArgs @("--version") | Format-List
Get-CommandStatus -Name "npm" -ToolArgs @("--version") | Format-List
Get-CommandStatus -Name "ollama" -ToolArgs @("--version") | Format-List
Get-CommandStatus -Name "docker" -ToolArgs @("--version") | Format-List

Write-Host "Arquivos importantes"
@(
  "server.js",
  "public\app.js",
  "data\aurora.sqlite",
  "data\secrets",
  "generated"
) | ForEach-Object {
  $path = Join-Path $ProjectRoot $_
  [pscustomobject]@{ Path = $_; Exists = Test-Path -LiteralPath $path }
} | Format-Table -AutoSize
