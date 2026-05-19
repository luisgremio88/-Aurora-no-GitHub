@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Organizar-Gerados-Aurora.ps1"
echo.
echo Para arquivar de verdade, rode:
echo powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Organizar-Gerados-Aurora.ps1" -Apply
pause
