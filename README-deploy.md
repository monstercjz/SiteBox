# SiteBox 部署指南

SiteBox 前后端分离架构，支持四种部署场景：

| 场景 | 适用平台 | 数据库 |
|------|----------|--------|
| [Docker Compose](#一docker-compose-部署nas--云容器--vps) | NAS / 云容器 / VPS | SQLite（命名 volume 持久化） |
| [VPS 裸机](#二vps-裸机部署) | 自有服务器 | SQLite（本地文件） |
| [Cloudflare](#三cloudflare-workers--d1-部署) | Cloudflare Workers | D1（托管数据库） |
| [前端独立部署](#四前端独立部署) | 任意静态托管平台 | — |

---

## 一、Docker Compose 部署（NAS / 云容器 / VPS）

### 适用场景
- Synology / QNAP NAS（安装了 Docker 套件）
- 腾讯云 / 阿里云容器服务
- 任意安装了 Docker 的 VPS

### 前提条件
- Docker >= 20.10
- Docker Compose v2（`docker compose` 命令）

### 部署步骤

```bash
# 1. 克隆代码
git clone <your-repo-url> sitebox
cd sitebox/SiteBox

# 2. 构建并启动（首次需要构建镜像，约 1-2 分钟）
docker compose up -d --build

# 3. 查看运行状态
docker compose ps
docker compose logs -f backend-app
```

### 服务端口

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|----------|------------|------|
| 前端 Nginx | 80 | 80 | 访问入口 |
| 后端 Nginx 代理 | 3001 | 3001 | API 反向代理 |
| 后端 Node.js | 3000 | 3000 | 后端服务（可选暴露） |

> 访问前端：`http://<你的IP地址>`
> 访问 API：`http://<你的IP地址>:3001/api/`

### 数据持久化

SQLite 数据库文件存储在 Docker 命名 volume `sitebox_data` 中：

```bash
# 查看 volume 位置
docker volume inspect sitebox_data

# 备份数据库
docker run --rm \
  -v sitebox_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/sitebox-backup.tar.gz -C /data .

# 恢复数据
docker run --rm \
  -v sitebox_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/sitebox-backup.tar.gz -C /data
```

#### 绑定挂载到宿主机指定目录（可选）

如果需要将数据库直接映射到宿主机路径（NAS 用户常见需求），修改 `docker-compose.yml`：

```yaml
# 将 volumes 段下的命名 volume 改为绑定挂载
services:
  backend-app:
    volumes:
      - /your/nas/path/sitebox-data:/app/data  # 替换为你的实际路径
```

### 修改端口

如需更改对外端口，修改 `docker-compose.yml` 中对应的 `ports` 配置：

```yaml
services:
  frontend-nginx:
    ports:
      - "8080:80"  # 将前端改为 8080 端口
```

### 常用命令

```bash
# 停止服务
docker compose down

# 重启后端
docker compose restart backend-app

# 查看后端日志
docker compose logs -f backend-app

# 更新代码后重新构建
docker compose up -d --build backend-app
```

---

## 二、VPS 裸机部署

### 适用场景
自有 Linux 服务器，不使用 Docker，直接运行 Node.js 进程。

### 前提条件
- Node.js >= 18
- npm >= 8
- 推荐使用 PM2 管理进程

### 部署步骤

```bash
# 1. 克隆代码
git clone <your-repo-url> sitebox
cd sitebox/SiteBox/backend

# 2. 安装依赖
npm install --omit=dev

# 3a. 直接启动（测试用）
node server.node.js

# 3b. 使用 PM2 后台运行（推荐生产环境）
npm install -g pm2
pm2 start server.node.js --name sitebox-backend
pm2 save
pm2 startup  # 设置开机自启
```

### 环境变量配置

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置
nano .env
```

`.env` 配置示例：

```env
PORT=3000
DB_PATH=/var/data/sitebox/sitebox.db
DEPLOY_MODE=docker
```

### 配合 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 三、Cloudflare Workers + D1 部署

### 前提条件
- Node.js >= 18
- Wrangler CLI：`npm install -g wrangler`
- Cloudflare 账户

### 后端部署步骤

```bash
cd SiteBox/backend

# 1. 安装依赖
npm install

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 D1 数据库
wrangler d1 create sitebox
# 命令输出示例：
# [[d1_databases]]
# binding = "DB"
# database_name = "sitebox"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 4. 将输出的 database_id 填入 wrangler.toml：
#    database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 5. 初始化远程数据库表结构
npm run db:migrate

# 6. 本地测试（使用本地 D1 模拟）
npm run db:migrate:local
wrangler dev

# 7. 部署到 Cloudflare Workers
npm run deploy:cf
```

### 前端部署到 Cloudflare Pages

```bash
cd SiteBox/frontend

# 1. 安装依赖并构建
npm install
npm run build

# 2. 部署静态资源到 CF Pages
wrangler pages deploy dist --project-name sitebox-frontend
```

> 部署完成后，在 CF Pages 项目设置中配置环境变量，将 API 地址指向 Workers 地址。

---

## 四、前端独立部署

前端构建产物为纯静态文件，可部署到任意静态托管平台。

### 构建

```bash
cd SiteBox/frontend
npm install
npm run build
# 产物输出在 dist/ 目录
```

### 部署方式

| 平台 | 方式 |
|------|------|
| Cloudflare Pages | `wrangler pages deploy dist` |
| Nginx | 将 `dist/` 复制到 `/usr/share/nginx/html/` |
| 腾讯云 COS / 阿里云 OSS | 上传 `dist/` 并开启静态网站托管 |
| GitHub Pages / Vercel / Netlify | 配置构建命令 `npm run build`，发布目录 `dist` |

---

## 五、浏览器插件配置

安装 `SiteBox/browser-extension/` 目录下的插件后：

1. 点击扩展图标 → 选项页
2. **API 地址**：填写后端地址
   - Docker 模式：`http://192.168.1.100:3001`（通过 backend-nginx 代理）
   - VPS 裸机模式：`http://your-domain.com/api`（或直接 `http://IP:3000`）
   - Cloudflare 模式：`https://sitebox-backend.your-worker.workers.dev`
3. **iframe 地址**：填写前端 URL（用于 newtab 页面嵌入）
4. 点击保存

---

## 六、数据库表结构

| 表名 | 说明 |
|------|------|
| `groups` | 网站分组和 Docker 分组 |
| `websites` | 网站书签 |
| `dockers` | Docker 容器配置 |
| `history` | 访问历史记录 |
| `user_settings` | 用户设置（key-value） |
| `backups` | 数据备份（最多保留 5 条） |

完整建表 SQL 见 `backend/schema.sql`。

---

## 七、从旧版本迁移

旧版本使用 JSON 文件存储（`data/*.json`），新版本使用 SQLite。如需迁移数据：

1. 启动新版本后端（会自动建表）
2. 通过旧版 API 导出数据：`GET /api/sync/backup`
3. 通过新版 API 导入：`POST /api/sync/restore`
