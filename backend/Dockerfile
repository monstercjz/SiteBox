# 建议使用 20 版本，性能更好且支持更多原生特性
FROM node:18-alpine
# FROM node:20-alpine

# 因为 better-sqlite3 是原生模块，在 Alpine 上安装可能需要这些构建工具
# 安装完后删除缓存以减小镜像体积
# RUN apk add --no-cache python3 make g++

WORKDIR /app

# 先拷贝 package 文件安装依赖，利用 Docker 缓存层
COPY package*.json ./

# 只安装生产环境依赖
RUN npm install --omit=dev

# 复制所有源代码
COPY . .

# 设置默认环境变量
ENV PORT=3000
ENV DEPLOY_MODE=docker
# 数据库路径：建议放在绝对路径，方便 PVE 挂载
ENV DB_PATH=/app/data/db/sitebox.db
# 用于将数据同步到 GitHub 仓库
# 1. 创建一个 GitHub Personal Access Token (Classic)，并授予 repo 权限
# 2. 填入 Token (ghp_...)
# 3. 填入目标仓库，格式：owner/repo (例如：yourname/sitebox-data)
# 4. 填入文件路径，例如：data/backup.json
ENV GITHUB_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
ENV GITHUB_REPO=xxxxxx/yyyyyyyy
ENV GITHUB_PATH=backup_json/backup.json

# 声明端口
EXPOSE $PORT

# 启动命令
# 1. 确保你的 server.node.js 里没有我们之前说的 import/export 混用错误
# 2. 生产环境直接运行，无需 --env-file（由 ENV 指令提供变量）
CMD ["node", "server.node.js"]
