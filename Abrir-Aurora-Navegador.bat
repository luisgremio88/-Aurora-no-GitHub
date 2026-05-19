@echo off
cd /d "%~dp0"
start "Aurora Local" /min powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Iniciar-Aurora-Seguro.ps1" -StartComfyUI -OpenBrowser
