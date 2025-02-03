## 目标架构：

我们将构建一个三层 Docker 部署架构：

1. 前端 Nginx (frontend-nginx):

- Serving 前端静态文件 (HTML, CSS, JavaScript, 图片等)。
- 将 /api 开头的请求反向代理到后端 Nginx (backend-nginx)。
- 监听宿主机 80 端口 (对外提供访问)。

2. 后端 Nginx (backend-nginx):

- 作为后端 Node.js 应用的反向代理。
- 处理 SSL 终止 (HTTPS 加密，可选)。
- 可以配置负载均衡 (如果需要扩展后端)。
- 监听容器内部 3001 端口 (仅供前端 Nginx 访问)。
- 将请求反向代理到后端 Node.js 应用 (backend-app)。

3. 后端 Node.js 应用 (backend-app):

- 运行后端 API 服务。
- 监听容器内部 3000 端口 (仅供后端 Nginx 访问)。
- 

## 配置文件准备：

### 前端 Nginx 配置文件 (frontend/nginx.conf):

在 frontend 目录下创建一个名为 nginx.conf 的文件，并复制粘贴以下内容：

```yaml
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

配置文件解释：

- upstream backend_server: 定义一个名为 backend_server 的 upstream，指向后端 Nginx 服务 backend-nginx:3001。 backend-nginx 是 Docker Compose 中后端 Nginx 服务的 service name，3001 是后端 Nginx 监听的容器内部端口。
- server: 定义一个 Nginx server 块，监听 80 端口。
  - root /usr/share/nginx/html: 指定前端静态文件根目录。
  - location /: 处理所有前端路由请求。 try_files $uri $uri/ /index.html; 用于 SPA (Single Page Application) 应用，确保在刷新页面或直接访问子路由时，仍然返回 index.html 文件，交给前端路由处理。
  - location /api/: 处理 /api/ 开头的请求。
    - proxy_pass http://backend_server: 将匹配 /api/ 的请求代理到 backend_server upstream，也就是后端 Nginx 服务。
    - proxy_set_header ...: 传递一些必要的 HTTP 头部信息给后端服务，例如 Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto 等。


### 后端 Nginx 配置文件 (backend/nginx.conf):

在 backend 目录下创建一个名为 nginx.conf 的文件，并复制粘贴以下内容：

```yaml
upstream backend_app_server {
    server backend-app:3000; # 后端 Node.js 应用服务地址和端口 (Docker 内部网络)
}

server {
    listen 3001; # 后端 Nginx 监听端口 (容器内部端口，前端 Nginx 访问此端口)
    server_name localhost; # 监听域名，可以根据需要修改

    location / {
        proxy_pass http://backend_app_server; # 将所有请求代理到后端 Node.js 应用
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

配置文件解释：

- upstream backend_app_server: 定义一个名为 backend_app_server 的 upstream，指向后端 Node.js 应用服务 backend-app:3000。 backend-app 是 Docker Compose 中后端 Node.js 应用服务的 service name，3000 是后端 Node.js 应用监听的容器内部端口。
- server: 定义一个 Nginx server 块，监听 3001 端口 (容器内部端口)。
  - location /: 将所有请求都代理到 backend_app_server upstream，也就是后端 Node.js 应用服务。
  - proxy_set_header ...: 同样传递必要的 HTTP 头部信息。

### SSL 终止 (HTTPS) 配置 (可选) :

如果您需要为后端 API 启用 HTTPS 加密，可以在 `backend/nginx.conf` 文件中配置 SSL 证书。  以下是一个简单的示例 (需要您自行替换为您的 SSL 证书路径和域名)：

```yaml
upstream backend_app_server {
    server backend-app:3000;
}

server {
    listen 3001 ssl; # 监听 3001 端口和 SSL
    server_name your_backend_domain.com; # 替换为您的后端域名

    ssl_certificate /path/to/your/ssl_certificate.crt; # 替换为您的 SSL 证书路径
    ssl_certificate_key /path/to/your/ssl_certificate.key; # 替换为您的 SSL 证书私钥路径

    location / {
        proxy_pass http://backend_app_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Dockerfile 修改：

### 前端 Dockerfile (frontend/Dockerfile):

#### **修改 frontend/Dockerfile 文件内容如下：**

```bash

FROM nginx:alpine

# 复制前端项目文件

COPY frontend/ /usr/share/nginx/html/

# 复制前端 Nginx 配置文件

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### **Dockerfile 修改说明：**

- COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf: 将我们创建的 frontend/nginx.conf 配置文件复制到 Nginx 容器的配置目录下。Nginx 会默认加载 /etc/nginx/conf.d/ 目录下的 .conf 文件。

### 后端 Dockerfile (backend/Dockerfile):

无需修改  之前的 backend/Dockerfile 已经可以正常构建后端 Node.js 应用镜像。

### 创建后端 Nginx Dockerfile (backend-nginx/Dockerfile):

在 backend-nginx 目录下 (与 backend 目录同级) 创建一个名为 Dockerfile 的文件，并复制粘贴以下内容：

```bash
FROM nginx:alpine

# 复制后端 Nginx 配置文件

COPY backend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001 # 暴露容器内部 3001 端口 (前端 Nginx 访问)

CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile 解释：

- FROM nginx:alpine: 同样使用 Nginx Alpine 镜像作为基础镜像。
- COPY backend/nginx.conf /etc/nginx/conf.d/default.conf: 将我们创建的 backend/nginx.conf 配置文件复制到 Nginx 容器的配置目录下。
- EXPOSE 3001: 暴露容器内部 3001 端口，这个端口是后端 Nginx 监听的端口，前端 Nginx 将会访问这个端口。
  docker-compose.yml 修改：

### 修改 docker-compose.yml 文件内容如下：

```yaml

version: "3.9"
services:
  frontend-nginx:
    build: ./frontend
    ports:
      - "80:80" # 宿主机 80 端口映射到前端 Nginx 容器 80 端口
    depends_on:
      - backend-nginx # 依赖后端 Nginx 服务

  backend-nginx:
    build: ./backend-nginx
    ports:
      - "3001:3001" # 宿主机 3001 端口 (可选，如果需要直接访问后端 Nginx)
    depends_on:
      - backend-app # 依赖后端 Node.js 应用服务

  backend-app:
    build: ./backend
    ports:
      - "3000:3000" # 宿主机 3000 端口 (可选，如果需要直接访问后端应用)
    volumes:
      - ./backend/data:/app/backend/data
    environment:
      PORT: 3000
      BACKEND_URL: http://localhost
```

docker-compose.yml 修改说明：

- 新增 frontend-nginx 服务：

  - build: ./frontend: 使用 frontend 目录下的 Dockerfile 构建镜像。
  - ports: - "80:80": 将宿主机 80 端口映射到前端 Nginx 容器的 80 端口，对外提供访问入口。
  - depends_on: - backend-nginx: 声明 frontend-nginx 服务依赖 backend-nginx 服务，确保 backend-nginx 服务先启动。
- 新增 backend-nginx 服务：

  - build: ./backend-nginx: 使用 backend-nginx 目录下的 Dockerfile 构建镜像。
  - ports: - "3001:3001": 将宿主机 3001 端口映射到后端 Nginx 容器的 3001 端口 (可选，如果需要直接访问后端 Nginx 进行测试或监控)。
  - depends_on: - backend-app: 声明 backend-nginx 服务依赖 backend-app 服务，确保 backend-app 服务先启动。
- backend-app 服务 (后端 Node.js 应用)：

  - build: ./backend: 保持不变，使用 backend 目录下的 Dockerfile 构建镜像。
  - ports: - "3000:3000": 将宿主机 3000 端口映射到后端 Node.js 应用容器的 3000 端口 (可选，如果需要直接访问后端应用进行测试或监控)。

## 目录结构：

修改后的项目目录结构应该如下所示：

personal-nav2/
├── backend/
│   ├── Dockerfile        (后端 Node.js 应用 Dockerfile，无需修改)
│   ├── nginx.conf        (后端 Nginx 配置文件)
│   ├── ...             (后端 Node.js 应用代码)
├── backend-nginx/
│   ├── Dockerfile        (后端 Nginx Dockerfile)
├── frontend/
│   ├── Dockerfile        (前端 Dockerfile，已修改)
│   ├── nginx.conf        (前端 Nginx 配置文件)
│   ├── ...             (前端代码)
├── docker-compose.yml    (已修改)
└── ...                 (其他项目文件)

## 部署和运行：

确保您已经创建了上述所有配置文件和 Dockerfile，并放置在正确的目录下。
在项目根目录下 (包含 docker-compose.yml 文件)，执行 docker-compose up -d 命令来构建和运行所有 Docker 容器。

## 访问应用：

前端应用： 通过浏览器访问 http://localhost (或 http://<您的服务器IP>)，前端 Nginx 监听宿主机 80 端口。
后端 API： 前端应用会通过 /api 前缀将 API 请求转发到后端 Nginx，后端 Nginx 再转发到后端 Node.js 应用。 您无需直接访问后端 Nginx 或后端 Node.js 应用的端口。
