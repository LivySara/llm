@echo off
REM Simple Chat - 启动脚本 (Windows)

echo.
echo ========================================
echo   简单聊天应用 - Simple Chat App
echo ========================================
echo.

REM 检查 Python 和 Node.js
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python。请先安装 Python。
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未找到 Node.js。前端需要 Node.js。
)

echo [1/4] 启动后端 (Django)...
cd chat-py
if not exist venv (
    echo 创建虚拟环境...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

echo [2/4] 初始化数据库...
python manage.py migrate >nul 2>&1

echo [3/4] 启动 Django 服务器...
start cmd /k python manage.py runserver

echo.
echo [4/4] 启动前端 (React)...
cd ..\chat-react
if not exist node_modules (
    echo 安装 npm 依赖...
    call npm install
)

echo.
echo ========================================
echo   应用启动完成！
echo ========================================
echo.
echo 后端: http://localhost:8000
echo 前端: http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务
echo.

call npm start
