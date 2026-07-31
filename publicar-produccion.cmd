@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0despliegueProduccion.ps1" %*
set "DEPLOY_EXIT=%ERRORLEVEL%"

if not "%DEPLOY_EXIT%"=="0" (
    echo.
    echo El despliegue de produccion no se completo. Revisa los mensajes anteriores.
) else (
    echo.
    echo Despliegue de produccion completado correctamente.
)

pause
exit /b %DEPLOY_EXIT%
