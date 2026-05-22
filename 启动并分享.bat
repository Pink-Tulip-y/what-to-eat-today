@echo off
cd /d "%~dp0"
echo.
echo ==============================
echo  Today What to Eat
echo ==============================
echo.
echo [1/2] Starting server...
start "Server" cmd /c "npm run dev"
timeout /t 4 >nul

echo [2/2] Starting tunnel...
echo.
echo   Share this link with others:
echo   ================================
bore.exe local 5173 --to bore.pub 2>&1 | findstr "listening"
echo   ================================
echo.
echo Press Ctrl+C to stop. If tunnel dies, restart this script.
pause
