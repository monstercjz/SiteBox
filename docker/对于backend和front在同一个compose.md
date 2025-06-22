## docker-compose
```bash
networks:
  app-network:
    driver: bridge

services:
  frontend-nginx:
    container_name: SiteBox
    image: monstercjz/sitebox-frontend-nginx:latest
    ports:
      - "80:80"
    depends_on:
      - backend-nginx
    networks:
      - app-network
    restart: always
    volumes:
      - /mnt/sdb/docker-data/data/SiteBox/SiteBoxFront:/usr/share/nginx/html:ro # 可以不设置

  backend-nginx:
    container_name: Sitebox-backend-nginx-server
    image: monstercjz/sitebox-backend-nginx:latest
    ports:
      - "3001:3001"
    depends_on:
      - backend-app
    networks:
      - app-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "nginx -t"]
      interval: 10s
      timeout: 5s
      retries: 3

  backend-app:
    container_name: SiteBox-backend-app-server
    image: monstercjz/sitebox-backend-app:latest
    ports:
      - "3000:3000"
    volumes:
      - /mnt/sdb/docker-data/data/SiteBox/SiteBoxData:/app/data
    environment:
      PORT: 3000
      BACKEND_URL: http://localhost
    networks:
      - app-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "node server.js --check"]
      interval: 10s
      timeout: 5s
      retries: 3
```
## frontend配置
- config.js
  > export const backendUrl = '/api';
- nginx.conf
```bash
upstream backend_server {
    server backend-nginx:3001; # 后端 Nginx 服务地址和端口 (Docker 内部网络)
}

server {
    listen 80;
    server_name localhost; # 监听域名，可以根据需要修改

    root /usr/share/nginx/html; # 前端静态文件根目录
    index index.html;

    location / {
        try_files $uri $uri/ /index.html; # SPA 应用，处理路由问题
    }

    location /api/ {
        proxy_pass http://backend_server; # 将 /api 开头的请求代理到后端 Nginx
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

