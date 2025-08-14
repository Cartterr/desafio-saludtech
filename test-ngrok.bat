@echo off
echo Testing ngrok setup...
echo.
echo 1. Make sure your app is running with: ./start.bat
echo 2. Then in another terminal run: ./start-ngrok.bat
echo 3. Or manually run:
echo    - ngrok http 3001 (for backend)
echo    - ngrok http 3000 (for frontend)
echo.
echo The start-ngrok.bat script will automatically:
echo - Create ngrok tunnels for both frontend and backend
echo - Configure the frontend to use the ngrok backend URL
echo - Display both public URLs
echo.
pause
