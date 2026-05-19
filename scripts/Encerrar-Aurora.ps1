param(
  [switch]$IncludeComfyUI
)

$ErrorActionPreference = "SilentlyContinue"

function Stop-PortProcess {
  param([int]$Port, [string]$Name)
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    Write-Host "$Name nao esta rodando na porta $Port."
    return
  }

  foreach ($connection in $connections) {
    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "Encerrando $Name na porta $Port (PID $($connection.OwningProcess), $($process.ProcessName))."
    Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Stop-PortProcess -Port 3123 -Name "Aurora"

if ($IncludeComfyUI) {
  Stop-PortProcess -Port 8188 -Name "ComfyUI"
} else {
  Write-Host "ComfyUI mantido aberto. Use -IncludeComfyUI para encerrar tambem."
}
