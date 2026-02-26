#!/bin/bash

echo "=========================================="
echo " Oblivion Blog 安装脚本 (Serv00专版)"
echo "=========================================="
echo ""

# 切换到脚本所在目录，防止因执行路径不对导致找不到相对目录
cd "$(dirname "$0")" || exit 1

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请在 Serv00 面板的 [Dodatki / Add-ons / Applications] 中启用 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 已就绪 ($NODE_VERSION)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

# 进入后端目录安装依赖
echo ""
echo "📦 正在安装依赖包，请稍候 (这可能需要 1-3 分钟)..."
cd backend
npm install --production --silent

if [ $? -ne 0 ]; then
    echo "❌ 依赖包安装失败！请重试。"
    exit 1
fi
echo "✅ 依赖包安装完成"

# 检查并安装 pm2
echo ""
echo "🔧 检查 PM2 进程管理器..."
if ! command -v pm2 &> /dev/null; then
    echo "由于未找到 PM2，现在进行全局安装..."
    npm install -g pm2 --silent
    if ! command -v pm2 &> /dev/null; then
        echo "⚠️ PM2 安装后仍未能在 PATH 中找到。"
        echo "你可能需要手动添加 ~/.npm-global/bin 到你的 PATH 环境变量中。"
        echo "或者你可以尝试不使用 PM2，直接运行: node server.js"
        # 尝试使用相对路径
        export PATH=$PATH:~/.npm-global/bin
    fi
fi

if command -v pm2 &> /dev/null; then
    echo "✅ PM2 已就绪"
    
    # 停止旧实例(如果存在)
    pm2 stop oblivion-blog 2>/dev/null
    pm2 delete oblivion-blog 2>/dev/null
    
    echo "🚀 正在启动博客服务..."
    PORT_HINT=""
    if [ ! -f ".env" ]; then
        echo "⚠️ 未发现 .env 文件。初次启动端口默认为 3001"
        PORT_HINT="(如果不清楚端口，请到 Serv00 面板的 Port reservation 分配一个端口使用)"
    fi
    
    pm2 start server.js --name "oblivion-blog"
    pm2 save
    
    echo ""
    echo "=========================================="
    echo "🎉 服务启动成功！"
    echo "=========================================="
    echo "下一步："
    echo "1. 请在您的浏览器中访问您的域名或服务器IP（加上端口，例如 http://your-domain.serv00.net:3001）"
    echo "2. 系统会自动重定向到 /install 安装向导"
    echo "3. 按照向导提示输入 MongoDB 地址和管理员账号完成最终配置"
    if [ -n "$PORT_HINT" ]; then
        echo ""
        echo "$PORT_HINT"
    fi
    echo "=========================================="
else
    echo "❌ 无法启动 PM2。请手动进入 backend 目录运行: node server.js"
fi
