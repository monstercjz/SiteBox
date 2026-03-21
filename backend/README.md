# SiteBox Backend

后端基于 `Hono`，提供统一的 REST API（前缀 `/api`）。

## 运行模式

### 1) Node 模式（本地 / VPS / Docker）

- 入口：`server.node.js`
- 数据库：SQLite（`better-sqlite3`）
- 启动：

```bash
npm install
npm run dev
# 或
npm start
```

默认端口：`3000`

### 2) Cloudflare Workers 模式

- 入口：`server.mjs`（`wrangler.toml` 中 `main` 指向该文件）
- 数据库：D1（binding：`DB`）
- 部署：

```bash
npm install
npx wrangler login
npm run deploy:cf
```

## 环境变量（Node 模式）

参考 `.env.example`：

- `PORT`：服务端口（默认 `3000`）
- `DB_PATH`：SQLite 文件路径（默认 `backend/data/db/sitebox.db`）
- `DEPLOY_MODE`：部署模式（如 `docker` / `cloudflare`）

## 数据库迁移

```bash
# 本地 D1 模拟
npm run db:migrate:local

# 远程 D1（生产）
npx wrangler d1 execute sitebox --remote --file=./schema.sql
```

## Cloudflare 注意事项（易错）

1. D1 绑定要求 Worker 使用 ES Module 入口（已采用 `server.mjs`）。
2. `npm run db:migrate` 默认执行本地 D1；生产请使用 `--remote`。
3. Cloudflare 环境无法直接使用本地 Docker daemon；Docker 实时控制接口会受限。
4. 若前端是 HTTPS，后端域名也应为 HTTPS。

## API 健康检查

- `GET /api/` -> `Backend service is running`

## 相关文件

- 路由入口：`app.js`
- Cloudflare 入口：`server.mjs`
- Node 入口：`server.node.js`
- Cloudflare 配置：`wrangler.toml`
- 建表 SQL：`schema.sql`
