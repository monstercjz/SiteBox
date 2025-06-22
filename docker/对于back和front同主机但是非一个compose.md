## docker-compose
不要backend-nginx的情况,前后端分离式部署，且在同一台服务器
若前后端不在同一服务器内，networks可以不用下面这样设置
### backend
```bash
services:
  backend-app:
    container_name: SiteBox-backend-app-server
    image: monstercjz/sitebox-backend-app:latest
    ports:
      - "3000:3000"
    volumes:
      - /mnt/sdb/test/SiteBoxData:/app/data
    environment:
      PORT: 3000
      BACKEND_URL: http://localhost
    networks:
      - shared_network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "node server.js --check"]
      interval: 10s
      timeout: 5s
      retries: 3
networks: # <--- 添加这部分 需要先执行docker network create my-app-network
  shared_network:
    external: true
    name: my-app-network # 指向你第一步创建的网络名
```
## frontend
不要backend-nginx的情况,前后端分离式部署，且在同一台服务器
若前后端不在同一服务器内，networks可以不用下面这样设置，直接将proxy_pass http://backend-app:3000;里的地址为后端真实地址
```bash
# compose-frontend.yml
version: '3.8' # 建议加上 version

# networks: # <--- 这个顶层的 networks 块应该在文件末尾，与 services 同级
#   shared_network:
#     external: true
#     name: my-app-network

services:
  frontend-nginx:
    container_name: SiteBox
    image: monstercjz/sitebox-frontend-nginx:1.0
    ports:
      - "80:80"
    networks: # 正确，服务加入共享网络
      - shared_network
    restart: always
    # 如果 Nginx 配置文件不是构建在镜像里的，需要 volumes 挂载
    # volumes:
    #   - ./path/to/your/frontend-nginx.conf:/etc/nginx/conf.d/default.conf
    #   - /path/to/your/static/frontend/files:/usr/share/nginx/html:ro

networks: # <--- 正确的位置，与 services同级
  shared_network: # 正确，定义逻辑网络名
    external: true
    name: my-app-network # 正确，指向预先创建的外部网络
```
## frontend配置
- config.js
  > export const backendUrl = '/api';
- nginx.conf
```bash
#upstream backend_server {
#    server backend-nginx:3001; # 后端 Nginx 服务地址和端口 (Docker 内部网络)
#}

server {
    listen 80;
    server_name localhost; # 监听域名，可以根据需要修改

    root /usr/share/nginx/html; # 前端静态文件根目录
    index index.html;

    location / {
        try_files $uri $uri/ /index.html; # SPA 应用，处理路由问题
    }

    location /api/ {
        proxy_pass http://backend-app:3000; # 将 /api 开头的请求代理到后端应用backend-app，切记3000后面不要跟带 /
         # 注意末尾的斜杠，根据后端期望的路径决定是否添加
        # 如果后端期望的是 /api/users，则用 http://203.0.113.50:3000
        # 如果后端期望的是 /users，则用 http://203.0.113.50:3000/
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
