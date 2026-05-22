@echo off
echo ==============================
echo  今天吃什么 - 打包构建
echo ==============================
echo.
echo [1/3] 构建前端...
call npm run build:client
if %errorlevel% neq 0 (
    echo 前端构建失败!
    pause
    exit /b 1
)
echo.
echo [2/3] 准备分发文件夹...
if exist "dist" rd /s /q "dist"
mkdir "dist\server\src"
xcopy /e "server\src" "dist\server\src" >nul
xcopy /e "server\node_modules" "dist\server\node_modules" >nul
copy "server\package.json" "dist\server\" >nul
copy "server\tsconfig.json" "dist\server\" >nul
xcopy /e "client\dist" "dist\client\dist" >nul
if exist ".env" copy ".env" "dist\" >nul
if not exist "dist\.env" copy "server\.env.example" "dist\.env" >nul
echo.
echo [3/3] 生成启动脚本...
(
echo @echo off
echo cd /d "%%~dp0server"
echo echo 今天吃什么 - 启动中...
echo echo 打开浏览器访问 http://localhost:3001
echo echo.
echo npx tsx src/index.ts
echo pause
) > "dist\启动.bat"
echo.
echo ==============================
echo  打包完成! 在 dist\ 文件夹中
echo  把整个 dist 文件夹发给别人
echo  对方双击「启动.bat」即可
echo ==============================
pause
