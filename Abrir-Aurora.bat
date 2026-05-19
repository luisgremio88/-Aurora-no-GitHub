@echo off
cd /d "%~dp0"
start "Aurora Desktop" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Iniciar-Aurora-Desktop.ps1" -StartComfyUI
