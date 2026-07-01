@echo off
REM 构建工具选择脚本

echo.
echo ========================================
echo   选择构建工具 / Choose Build Tool
echo ========================================
echo.
echo 1. Vite (推荐/Recommended) - 快速、轻量级
echo 2. Webpack - 完整、可控
echo.

set /p choice="选择 (1或2) / Choose (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo [正在设置 Vite...] / [Setting up Vite...]
    copy package.vite.json package.json
    echo [删除旧依赖...] / [Removing old dependencies...]
    if exist node_modules rmdir /s /q node_modules
    if exist package-lock.json del package-lock.json
    echo [安装依赖...] / [Installing dependencies...]
    call npm install
    echo.
    echo ✅ Vite 配置完成！
    echo.
    echo 启动开发服务器 / Start dev server:
    echo   npm run dev
    echo.
) else if "%choice%"=="2" (
    echo.
    echo [正在设置 Webpack...] / [Setting up Webpack...]
    copy package.webpack.json package.json
    echo [删除旧依赖...] / [Removing old dependencies...]
    if exist node_modules rmdir /s /q node_modules
    if exist package-lock.json del package-lock.json
    echo [安装依赖...] / [Installing dependencies...]
    call npm install
    echo.
    echo ✅ Webpack 配置完成！
    echo.
    echo 启动开发服务器 / Start dev server:
    echo   npm run dev
    echo.
) else (
    echo 无效选择 / Invalid choice!
    exit /b 1
)

echo 访问浏览器 / Open browser: http://localhost:3000
pause
