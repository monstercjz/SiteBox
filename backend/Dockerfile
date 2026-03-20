FROM node:18-alpine

WORKDIR /app

# 安装依赖（利用缓存分层）
COPY package*.json ./
RUN npm install --omit=dev

# 复制应用代码
COPY . .

# 创建非 root 用户运行应用
# RUN addgroup -S sitebox && adduser -S sitebox -G sitebox \
#     && mkdir -p /app/data \
#     && chown -R sitebox:sitebox /app

# USER sitebox

# 声明数据目录为卷，便于宿主机挂载持久化 SQLite 文件
# VOLUME ["/app/data"]

EXPOSE 3000

# 健康检查：调用真实 API 端点
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#     CMD wget -q --spider http://localhost:3000/api/ || exit 1

CMD ["node", "server.node.js"]
