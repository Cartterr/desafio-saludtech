@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
set "ROOT=%~dp0"
cd /d "%ROOT%"

if "%BACKEND_PORT%"=="" set BACKEND_PORT=3001
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=3000

where yarn >nul 2>nul && set PM=yarn
if not defined PM (where pnpm >nul 2>nul && set PM=pnpm)
if not defined PM set PM=npm

echo.
echo TODO System - NGROK MODE
echo Booting full stack dev services with ngrok support
echo Backend: http://localhost:!BACKEND_PORT!
echo Frontend: http://localhost:!FRONTEND_PORT!
echo PM=!PM!  ROOT=!ROOT!
echo.

if not exist "%ROOT%backend\node_modules" call :install_backend
if not exist "%ROOT%frontend\node_modules" call :install_frontend
if not exist "%ROOT%node_modules\.bin\concurrently.cmd" call :install_root

echo ^> 0.2%% > "frontend\.browserslistrc"
echo not dead >> "frontend\.browserslistrc"
echo not op_mini all >> "frontend\.browserslistrc"

echo Liberando puerto backend !BACKEND_PORT!
call :free_port !BACKEND_PORT!
echo Liberando puerto frontend !FRONTEND_PORT!
call :free_port !FRONTEND_PORT!

set "FRONTEND_NGROK_URL="
set "BACKEND_NGROK_URL="

where ngrok >nul 2>nul
if errorlevel 1 (
    echo ERROR: ngrok no esta instalado. Instala ngrok primero.
    pause
    exit /b 1
)

echo Iniciando ngrok para backend en puerto !BACKEND_PORT!...
start "ngrok-backend" cmd /c "ngrok http !BACKEND_PORT! --log stdout > ngrok-backend.log 2>&1"

echo Iniciando ngrok para frontend en puerto !FRONTEND_PORT!...
start "ngrok-frontend" cmd /c "ngrok http !FRONTEND_PORT! --log stdout > ngrok-frontend.log 2>&1"

echo Esperando a que ngrok se conecte...
timeout /t 8 >nul

for /f "tokens=*" %%i in ('powershell -Command "& {(Get-Content ngrok-backend.log | Select-String 'https://.*\.ngrok\.app' | Select-Object -First 1).Matches.Value}"') do set "BACKEND_NGROK_URL=%%i"

for /f "tokens=*" %%i in ('powershell -Command "& {(Get-Content ngrok-frontend.log | Select-String 'https://.*\.ngrok\.app' | Select-Object -First 1).Matches.Value}"') do set "FRONTEND_NGROK_URL=%%i"

if "!BACKEND_NGROK_URL!"=="" (
    echo ERROR: No se pudo obtener la URL de ngrok para el backend
    pause
    exit /b 1
)

if "!FRONTEND_NGROK_URL!"=="" (
    echo ERROR: No se pudo obtener la URL de ngrok para el frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo FRONTEND NGROK URL: !FRONTEND_NGROK_URL!
echo BACKEND NGROK URL: !BACKEND_NGROK_URL!/api
echo ========================================
echo.

set "FRONT_CMD=cd /d frontend && set NODE_ENV=development&& set BROWSER=none&& set BROWSERSLIST_IGNORE_OLD_DATA=1&& set REACT_APP_API_BASE=!BACKEND_NGROK_URL!/api&& set PUBLIC_URL=!FRONTEND_NGROK_URL!&& !PM! start"
set "BACK_CMD=cd /d backend && set NODE_ENV=development&& set PORT=!BACKEND_PORT!&& !PM! run dev"

echo Ejecutando ambos servicios con concurrently
"%ROOT%node_modules\.bin\concurrently.cmd" -k --handle-input -n frontend,backend -c magenta,blue "%FRONT_CMD%" "%BACK_CMD%"

echo.
echo Acceso publico: !FRONTEND_NGROK_URL!
echo Backend publico: !BACKEND_NGROK_URL!/api
echo Backend local: http://localhost:!BACKEND_PORT!/api
echo.
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

:install_root
echo Instalando herramientas base
if not exist package.json (
    echo {"name":"todo-system","private":true} > package.json
)
if "%PM%"=="npm" (
  npm install --save-dev concurrently
) else (
  if "%PM%"=="yarn" (
    yarn add -D concurrently
  ) else (
    pnpm add -D concurrently
  )
)
exit /b
