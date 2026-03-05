FROM nginx:alpine

# 复制后端 Nginx 配置文件为模板，支持环境变量
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 暴露容器内部 3001 端口 (前端 Nginx 访问)
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]