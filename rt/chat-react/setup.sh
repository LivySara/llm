#!/bin/bash

# 构建工具选择脚本

echo ""
echo "========================================"
echo "  选择构建工具 / Choose Build Tool"
echo "========================================"
echo ""
echo "1. Vite (推荐/Recommended) - 快速、轻量级"
echo "2. Webpack - 完整、可控"
echo ""

read -p "选择 (1或2) / Choose (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "[正在设置 Vite...] / [Setting up Vite...]"
    cp package.vite.json package.json
    echo "[删除旧依赖...] / [Removing old dependencies...]"
    rm -rf node_modules package-lock.json yarn.lock
    echo "[安装依赖...] / [Installing dependencies...]"
    npm install
    echo ""
    echo "✅ Vite 配置完成！"
    echo ""
    echo "启动开发服务器 / Start dev server:"
    echo "  npm run dev"
    echo ""
elif [ "$choice" = "2" ]; then
    echo ""
    echo "[正在设置 Webpack...] / [Setting up Webpack...]"
    cp package.webpack.json package.json
    echo "[删除旧依赖...] / [Removing old dependencies...]"
    rm -rf node_modules package-lock.json yarn.lock
    echo "[安装依赖...] / [Installing dependencies...]"
    npm install
    echo ""
    echo "✅ Webpack 配置完成！"
    echo ""
    echo "启动开发服务器 / Start dev server:"
    echo "  npm run dev"
    echo ""
else
    echo "无效选择 / Invalid choice!"
    exit 1
fi

echo "访问浏览器 / Open browser: http://localhost:3000"
