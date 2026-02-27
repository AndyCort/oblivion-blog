# Oblivion Blog

A modern, dynamic blog system built with React, Node.js, and MongoDB.

## 一键安装到 Serv00

如果您使用 [Serv00](https://www.serv00.com/) 免费主机，现在支持一键无脑傻瓜式安装了！

### 安装步骤

1. 登录 Serv00 控制面板 (Devil WEB interface)。
2. 转到 **WWW Websites**，点击 **Add new website**。
3. 填写您的域名，**Advanced** 设置中，将 **Type** 选择为 **Node.js**，然后保存配置 (Add)。
4. 使用 SSH 客户端登录您的 Serv00 服务器。
5. 进入刚才创建的站点目录：
   ```bash
   cd ~/domains/您的域名/public_nodejs
   ```
6. 执行以下一键安装命令：
   ```bash
   bash <(curl -s https://raw.githubusercontent.com/AndyCort/oblivion-blog/main/install-serv00.sh)
   ```
7. 脚本跑完后，直接打开浏览器访问您的域名：`http://您的域名/install`
8. 根据向导提示，连接 MongoDB 数据库并创建管理员账号，完成！

## 后续更新

在部署界面，您可以直接点击**“一键傻瓜式更新”**按钮，系统会在后台自动完成代码拉取、后端 npm install、前端构建、最后自动更新，完全不需要再次登录 SSH。
