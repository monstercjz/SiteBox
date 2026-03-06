
针对从云端（Docker Hub）拉取镜像的使用场景，以下是两种情况下的 `docker-compose.yml` 标准配置模板。

假设你的 Docker Hub 用户名是 `yourname`。

### 情况一：三者运行在“同一台”服务器上
这是最推荐的部署方式。三者通过 Docker 内部网络互联，安全性最高，配置最简单。

```yaml
version: "3.9"

services:
  # 1. 前端 Nginx (处理静态文件和 API 转发)
  frontend-nginx:
    image: yourname/sitebox-frontend:latest
    container_name: SiteBox-Front
    ports:
      - "80:80"
    environment:
      - BACKEND_ADDR=backend-nginx-proxy:3001 # 使用服务名相互访问
    networks:
      - app-network
    restart: always

  # 2. 后端 Nginx (安全过滤和 Node 代理)
  backend-nginx-proxy:
    image: yourname/sitebox-backend-nginx:latest
    container_name: SiteBox-Back-Nginx
    environment:
      - BACKEND_APP_ADDR=backend-app-server:3000 # 使用服务名访问 Node 应用
    networks:
      - app-network
    restart: always

  # 3. 后端 Node.js 应用
  backend-app-server:
    image: yourname/sitebox-backend:latest
    container_name: SiteBox-Back-App
    volumes:
      - /var/lib/sitebox/data:/app/data # 数据持久化
    networks:
      - app-network
    restart: always

networks:
  app-network:
    driver: bridge
```

---

### 情况二：三者运行在“不同”服务器上
在这种情况下，容器之间无法通过 Docker 内部网络访问，必须通过 **宿主机 IP + 端口** 进行通信。

#### 服务器 A：运行 `frontend-nginx`
```yaml
services:
  frontend-nginx:
    image: yourname/sitebox-frontend:latest
    ports:
      - "80:80"
    environment:
      # 这里必须填 服务器 B 的公网或内网 IP
      - BACKEND_ADDR=192.168.1.101:3001 
    restart: always
```

#### 服务器 B：运行 `backend-nginx`
```yaml
services:
  backend-nginx-proxy:
    image: yourname/sitebox-backend-nginx:latest
    ports:
      - "3001:3001" # 必须暴露端口供服务器 A 访问
    environment:
      # 这里必须填 服务器 C 的公网或内网 IP
      - BACKEND_APP_ADDR=192.168.1.102:3000 
    restart: always
```

#### 服务器 C：运行 `backend-app`
```yaml
services:
  backend-app-server:
    image: yourname/sitebox-backend:latest
    ports:
      - "3000:3000" # 必须暴露端口供服务器 B 访问
    volumes:
      - /var/lib/sitebox/data:/app/data
    restart: always
```

---

### 关键点对比：

| 配置项 | 同一台服务器 (推荐) | 不同服务器 |
| :--- | :--- | :--- |
| **互访方式** | 使用 Docker `service_name` (如 `backend-nginx-proxy`) | 使用 宿主机 IP 地址 (如 `192.168.1.x`) |
| **端口暴露** | 只有前端 `80` 端口需要对公网开放 | 每一层都需要开放对应端口 (3001, 3000) |
| **网络** | 共享同一个 Docker `networks` | 不需要 Docker networks (走物理网络) |
| **安全性** | 内部通信不经过公网，安全性极高 | 内部通信经过公网，需要额外配置防火墙/白名单 |

### 部署建议：
1.  **更新镜像**：当你本地推送了新镜像后，在服务器执行 `docker compose pull && docker compose up -d` 即可完成无损更新。
2.  **安全性**：如果分服务器部署，请务必在服务器 B 和 C 的防火墙上设置白名单，只允许来自上游服务器 IP 的访问。
3.  **持久化**：情况二中的服务器 C 必须处理好 `volumes` 的备份，因为那是你的核心数据所在。