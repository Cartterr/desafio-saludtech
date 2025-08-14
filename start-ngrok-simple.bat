@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
set "ROOT=%~dp0"
cd /d "%ROOT%"

if "%BACKEND_PORT%"=="" set BACKEND_PORT=3001

where yarn >nul 2>nul && set PM=yarn
if not defined PM (where pnpm >nul 2>nul && set PM=pnpm)
if not defined PM set PM=npm

echo.
echo TODO System - SIMPLE NGROK MODE
echo Building frontend and serving through backend on port !BACKEND_PORT!
echo.

if not exist "%ROOT%backend\node_modules" call :install_backend
if not exist "%ROOT%frontend\node_modules" call :install_frontend

echo Building frontend for production...
pushd "%ROOT%frontend"
if "%PM%"=="npm" (
  npm run build
) else (
  if "%PM%"=="yarn" (
    yarn build
  ) else (
    pnpm run build
  )
)
popd

if not exist "%ROOT%frontend\build" (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo Liberando puerto backend !BACKEND_PORT!
call :free_port !BACKEND_PORT!

where ngrok >nul 2>nul
if errorlevel 1 (
    echo ERROR: ngrok no esta instalado. Instala ngrok primero.
    pause
    exit /b 1
)

echo Iniciando backend con frontend integrado...
start "backend-with-frontend" cmd /c "cd /d backend && set NODE_ENV=production && set PORT=!BACKEND_PORT! && !PM! start"

timeout /t 3 >nul

echo Iniciando ngrok para puerto !BACKEND_PORT!...
start "ngrok" cmd /c "ngrok http !BACKEND_PORT! --log stdout > ngrok-simple.log 2>&1"

timeout /t 5 >nul

for /f "tokens=*" %%i in ('powershell -Command "& {(Get-Content ngrok-simple.log | Select-String 'https://.*\.ngrok\.app' | Select-Object -First 1).Matches.Value}"') do set "NGROK_URL=%%i"

if "!NGROK_URL!"=="" (
    echo ERROR: No se pudo obtener la URL de ngrok
    echo Revisando log de ngrok...
    type ngrok-simple.log
    pause
    exit /b 1
)

echo.
echo ========================================
echo PUBLIC URL: !NGROK_URL!
echo Backend + Frontend served from: !NGROK_URL!
echo API available at: !NGROK_URL!/api
echo ========================================
echo.
echo Press any key to stop ngrok and backend...
pause

echo Stopping services...
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

goto :eof

:install_backend
echo Instalando dependencias del backend
pushd "%ROOT%backend" || (echo No se puede acceder a %ROOT%backend & exit /b 1)
if "%PM%"=="npm" (
  npm install
) else (
  if "%PM%"=="yarn" (
    yarn install
  ) else (
    pnpm install
  )
)
popd
exit /b

:free_port
set PORT_TO_FREE=%1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT_TO_FREE%" ^| find "LISTENING"') do (
    echo Matando proceso %%a en puerto %PORT_TO_FREE%
    taskkill /f /pid %%a >nul 2>&1
)
echo Puerto %PORT_TO_FREE% liberado
exit /b

:install_frontend
echo Instalando dependencias del frontend
pushd "%ROOT%frontend" || (echo No se puede acceder a %ROOT%frontend & exit /b 1)
if "%PM%"=="npm" (
  npm install
) else (
  if "%PM%"=="yarn" (
    yarn install
  ) else (
    pnpm install
  )
)
popd
exit /b
