# SiteBox 部署指南（更新版）

本文覆盖 SiteBox 的主流部署方式，并总结常见踩坑点。

## 部署方案总览

| 方案 | 适用场景 | 后端 | 数据库 |
|---|---|---|---|
| Docker Compose | NAS / VPS / 本地一键部署 | Node | SQLite |
| VPS 裸机 | 自有服务器进程化部署 | Node + PM2 | SQLite |
| Cloudflare Workers | 轻量云端 API | Workers | D1 |
| 前端独立托管 | Pages / Nginx / Vercel 等 | 静态文件 | - |

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
  -v sitebox_data:/data/db \
  -v $(pwd):/backup \
  alpine tar czf /backup/sitebox-backup.tar.gz -C /data .

# 恢复数据
docker run --rm \
  -v sitebox_data:/data/db \
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

# 3a. 直接启动（测试用，使用代码中默认回落的值）
node server.node.js
# 或者需要改变环境端口等信息值的话
cp .env.example .env
nano .env
node --env-file=.env server.node.js

#推荐使用 PM2：

# 3b. 使用 PM2 后台运行（推荐生产环境）

npm install -g pm2
cp .env.example .env
nano .env
pm2 start server.node.js --node-args="--env-file=.env" --name sitebox-backend
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
DB_PATH=/var/data/sitebox/db/sitebox.db
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

### 初始化 D1（非常关键）

```bash
# 本地 D1 模拟
npm run db:migrate:local

# 远程生产 D1（推荐显式 --remote）
npx wrangler d1 execute sitebox --remote --file=./schema.sql
```

### 访问

- Worker 地址示例：`https://xxx.workers.dev`
- 健康检查：`GET https://xxx.workers.dev/api/`

---

## 四、前端独立部署

前端是静态资源，可托管在 Cloudflare Pages/Nginx/Vercel/Netlify 等。

```bash
cd SiteBox/frontend
npm install
npm run build
```

发布目录：`dist/`

---

## 五、前端后端地址设置（重点）

前端支持在页面右下角「后端地址设置」中配置 API 主机地址。

### 填写规则

- 只填主机地址，不要填 `/api`
- 正确示例：
  - `https://api.example.com`
  - `http://192.168.1.10:3000`
  - `https://sb.nuaa.dpdns.org`
- 错误示例：
  - `https://api.example.com/api`（会重复拼接）
  - `https://api.example.com/v1`（不支持带业务路径）

系统会自动拼接 `/api`。

### 清空设置后行为

- 清空会移除 localStorage 中的 `backendUrl`
- 前端回退到默认 `/api`

### 对于nginx已经设置了地址的情况

- 首次打开页面的时候还是会检查缓存，如果没有地址，就会有设置界面弹出
- 如果在设置界面设置了地址，就会根据设置的地址进行请求，nginx的地址将会无效
- 如果继续使用nginx的地址，界面不设置地址，关闭之后，会缓存`backendSettingDismissed=true`,记录到本页面曾打开过，后续刷新页面不再弹窗显示

---

## 六、常见错误与排查

### 1) `ERR_CONNECTION_TIMED_OUT`（常见于误填 `:3000`）

原因：地址/端口不可达或端口未开放。

排查：

- 检查是否应使用 `https://域名` 而不是 `https://域名:3000`
- 检查服务器安全组与防火墙

### 2) `Unexpected non-whitespace character after JSON`

原因：接口返回了非 JSON（如网关 HTML/404 文本）。

排查：

- 直接访问接口确认返回体
- 确认反向代理路径是否正确指向 `/api`

### 3) Cloudflare D1 迁移后没数据

原因：只执行了本地迁移，未执行远程迁移。

修复：

```bash
npx wrangler d1 execute sitebox --remote --file=./schema.sql
```

### 4) Cloudflare 下 Docker 实时信息 404/不可用

原因：Cloudflare 运行环境不具备本地 Docker daemon 能力。

结论：该能力在 CF 模式下应视为受限功能。

### 5) 前端 HTTPS + 后端 HTTP 被拦截

原因：Mixed Content。

修复：后端也启用 HTTPS，或统一走同域反向代理。

---

## 七、浏览器插件配置

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
