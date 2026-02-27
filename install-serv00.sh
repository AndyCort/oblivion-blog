#!/bin/bash

# ==============================================================================
# Oblivion Blog - Serv00 一键傻瓜式安装脚本
# 作者: Andy Cort & Antigravity
# ==============================================================================

echo -e "\n=============================================="
echo -e "🚀 欢迎使用 Oblivion Blog (Serv00 专版) 一键安装"
echo -e "==============================================\n"

# 1. 检查运行环境
current_dir=$(pwd)
echo "📁 当前所在目录: $current_dir"

if [[ "$current_dir" != *"public_nodejs"* ]]; then
    echo -e "\n❌ 错误: 环境不正确！"
    echo -e "请在 Serv00 面板中创建 Node.js 网站，并在对应的 public_nodejs 目录下执行此脚本。"
    echo -e "👉 正确路径示例: /usr/home/您的用户名/domains/您的域名/public_nodejs"
    exit 1
fi

domain=$(basename $(dirname "$current_dir"))
echo -e "🌐 检测到您的域名为: $domain\n"

# 2. 拉取源代码
if [ -d ".git" ]; then
    echo "⬇️  检测到已有代码库，正在拉取最新更新..."
    git pull origin main || echo "⚠️  拉取最新代码失败，可能需要先处理冲突。"
else
    echo "⬇️  正在下载核心源代码 (从 GitHub 克隆)..."
    # 清空目录（Serv00默认可能会生成一些空文件）
    rm -rf * 2>/dev/null
    git clone https://github.com/AndyCort/oblivion-blog.git temp_blog
    if [ $? -ne 0 ]; then
        echo -e "\n❌ 错误: 无法连接 GitHub，下载源代码失败！"
        exit 1
    fi
    mv temp_blog/* .
    mv temp_blog/.[!.]* . 2>/dev/null
    rm -rf temp_blog
fi

# 3. 安装后端依赖
echo -e "\n⚙️  正在安装后端依赖环境..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo -e "\n❌ 错误: 后端依赖安装失败！"
    exit 1
fi
cd ..

# 4. 编译前端应用程序
echo -e "\n⚙️  正在构建前端博客界面 (可能需要 1-3 分钟)..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo -e "\n❌ 错误: 前端编译失败！"
    exit 1
fi

# 5. 清理空间 (Serv00 空间有限)
echo -e "\n🧹 正在清理前端临时打包文件释放存储空间..."
rm -rf node_modules
cd ..

# 6. 配置 App.js 入口
echo -e "\n🔌 正在配置 Passenger (Serv00 Node 托管引擎) 入口..."
if [ ! -f "app.js" ]; then
    echo "require('./backend/server.js');" > app.js
fi

# 7. 重启服务
echo -e "\n🔄 正在重启 Serv00 上的 Node.js 服务 ($domain)..."
devil www restart $domain

echo -e "\n=============================================="
echo -e "🎉 恭喜！安装过程已全部完成！"
echo -e "=============================================="
echo -e "👉 下一步: 请直接在您的浏览器中访问网站进行初始化配置。"
echo -e "🔗 访问地址: http://$domain/install\n"
