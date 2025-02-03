FROM nginx:alpine

# 复制后端 Nginx 配置文件
COPY backend/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露容器内部 3001 端口 (前端 Nginx 访问)
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]