@echo off
cd /d "%~dp0server"
start http://localhost:3001
echo ==============================
echo  今天吃什么
echo  打开 http://localhost:3001
echo  关闭此窗口停止服务
echo ==============================
node_modules\.bin\tsx src/index.ts
pause
