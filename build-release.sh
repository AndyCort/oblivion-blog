#!/bin/bash

echo "🚀 构建本地测试部署包..."

# 清理旧的
rm -rf release
rm -f oblivion-blog-local-release.zip
mkdir -p release/frontend

echo "📦 正在编译前端..."
cd frontend
npm ci --silent
npm run build
cd ..

echo "📂 复制文件..."
# 复制后端（排除 node_modules 和 .env）
rsync -av --exclude='node_modules' --exclude='.env' backend/ release/backend/
# 复制前端编译产出
cp -r frontend/dist release/frontend/dist
# 复制安装脚本
cp install.sh release/install.sh
chmod +x release/install.sh

echo "🗜️ 打包成 zip..."
cd release
zip -r ../oblivion-blog-local-release.zip . > /dev/null
cd ..

echo "✅ 打包完成: oblivion-blog-local-release.zip"
echo "你可以将其解压测试。"
