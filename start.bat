@echo off
cd /d "d:\VS Code\what-to-eat-today"
echo 启动后端...
start "后端" cmd /c "npm run dev:server"
echo 启动前端...
start "前端" cmd /c "npm run dev:client"
echo.
echo 等待启动...
timeout /t 4 >nul
echo.
echo ============================
echo  本机: http://localhost:5173
echo ============================
echo.
echo 需要分享给别人？在终端运行: npx bore local 5173 --to bore.pub
echo.
pause
