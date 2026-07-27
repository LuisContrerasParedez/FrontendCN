@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
set "DEPLOY_EXIT=%ERRORLEVEL%"

if not "%DEPLOY_EXIT%"=="0" (
    echo.
    echo El despliegue no se completo. Revisa los mensajes anteriores.
) else (
    echo.
    echo Despliegue completado correctamente.
)

pause
exit /b %DEPLOY_EXIT%
