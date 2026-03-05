FROM nginx:alpine

# 复制前端项目文件 (修正后的 COPY 命令，适用于显式构建上下文)
COPY . /usr/share/nginx/html/

# 复制前端 Nginx 配置文件为模板，支持环境变量
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]