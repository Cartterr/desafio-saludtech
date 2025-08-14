@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
set "ROOT=%~dp0"
cd /d "%ROOT%"

if "%BACKEND_PORT%"=="" set BACKEND_PORT=3001
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=3000
set API_URL=http://localhost:%BACKEND_PORT%/api

where yarn >nul 2>nul && set PM=yarn
if not defined PM (where pnpm >nul 2>nul && set PM=pnpm)
if not defined PM set PM=npm

echo.
echo TODO System
echo Booting full stack dev services
echo Backend: http://localhost:!BACKEND_PORT!  API: !API_URL!
echo Frontend: http://localhost:!FRONTEND_PORT!
echo PM=!PM!  ROOT=!ROOT!  CWD=!CD!
if not exist "%ROOT%backend" echo Missing directory: %ROOT%backend
if not exist "%ROOT%frontend" echo Missing directory: %ROOT%frontend
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

set "FRONT_CMD=cd /d frontend && set NODE_ENV=development&& set BROWSER=none&& set BROWSERSLIST_IGNORE_OLD_DATA=1&& set REACT_APP_API_BASE=!API_URL!&& !PM! start"
set "BACK_CMD=cd /d backend && set NODE_ENV=development&& set PORT=!BACKEND_PORT!&& set DEEPSEEK_API_KEY=sk-4f60e10cafb04928a9118886e05091a9&& !PM! run dev"
echo Ejecutando ambos servicios con concurrently
"%ROOT%node_modules\.bin\concurrently.cmd" -k --handle-input -n frontend,backend -c magenta,blue "%FRONT_CMD%" "%BACK_CMD%"

echo.
echo Acceso: http://localhost:!FRONTEND_PORT!   API: !API_URL!
echo Usando: !PM!  NODE_ENV=development
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