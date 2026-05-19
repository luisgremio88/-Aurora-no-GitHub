@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Encerrar-Aurora.ps1" -IncludeComfyUI
pause
