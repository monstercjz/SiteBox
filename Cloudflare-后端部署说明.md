# Cloudflare 后端部署说明（SiteBox）

本文专门说明：

1. `wrangler.toml` 的意义
2. 使用 Wrangler CLI 部署后端到 Cloudflare Workers 的方式
3. 不依赖本地 CLI、仅使用 Cloudflare 网页端部署后端的详细步骤

---

## 1. 什么是 `wrangler.toml`

`backend/wrangler.toml` 是 Worker 项目的部署配置文件，相当于 Cloudflare 的“项目清单”。

当前项目示例：

```toml
name = "sitebox-backend"
main = "server.mjs"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "sitebox"
database_id = "148bb43e-fb40-4dc5-94e0-f2e689194b4b"

[vars]
DEPLOY_MODE = "cloudflare"
```

各字段含义：

- `name`：Worker 服务名（最终会生成 `<name>.<subdomain>.workers.dev`）
- `main`：入口文件（本项目是 `server.mjs`，ES Module）
- `compatibility_date`：Cloudflare 运行时兼容日期
- `compatibility_flags`：运行时特性开关（这里启用 `nodejs_compat`）
- `[[d1_databases]]`：D1 数据库绑定
  - `binding = "DB"` 表示代码里通过 `env.DB` 访问数据库
  - `database_id` 指向具体 D1 数据库
- `[vars]`：普通环境变量（非敏感）

> 注意：`database_id` 通常是资源标识，不是密钥；真正敏感的是 API Token / Secret。

---

## 2. 使用 Wrangler CLI 部署（推荐）

适用于你当前这套 SiteBox 后端，最稳妥。

### 2.1 前提

- Node.js >= 18
- Cloudflare 账户
- 已在 `backend/` 中准备好 `wrangler.toml`

### 2.2 部署步骤

```bash
cd SiteBox/backend
npm install
npx wrangler login
npm run deploy:cf
```

部署成功后会输出 Worker 地址，如：

- `https://sitebox-backend.xxx.workers.dev`

### 2.3 D1 初始化（非常关键）

本项目有 `schema.sql`，必须导入到**远程** D1 才能正常使用。

```bash
# 本地模拟库（开发调试）
npm run db:migrate:local

# 远程生产库（正式环境）
npx wrangler d1 execute sitebox --remote --file=./schema.sql
```

> 易错点：`npm run db:migrate` 在很多场景默认是本地库，不等于线上库。生产务必带 `--remote`。

### 2.4 验证

```bash
curl https://<your-worker-domain>/api/
```

预期返回：

- `Backend service is running`

---

## 3. 网页端部署后端到 Cloudflare（不使用本地 CLI）

可以做到，但步骤更繁琐，适合不想在本地装 Wrangler 的场景。

## 方案 A：Dashboard 新建 Worker + 绑定 D1（手动上传代码）

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 点击 **Create Application** -> **Create Worker**
4. 选择编辑方式（在线编辑器）并创建服务
5. 将后端代码上传/粘贴到 Worker 项目（需保证入口等价于 `server.mjs`）
6. 打开 Worker 的 **Settings** -> **Variables**
   - 添加普通变量：`DEPLOY_MODE=cloudflare`
7. 打开 **Settings** -> **Bindings** -> **D1 database bindings**
   - 新增 binding 名称：`DB`
   - 绑定到数据库 `sitebox`
8. 保存并部署
9. 进入 **D1** 控制台，找到 `sitebox` 数据库
10. 打开 SQL 控制台，执行 `backend/schema.sql` 中建表语句
11. 访问 `https://<worker-domain>/api/` 验证

## 方案 B：Dashboard 连接 Git 仓库自动部署（推荐的网页端方式）

1. 登录 Cloudflare Dashboard
2. 进入 **Workers & Pages**
3. 点击 **Create Application** -> **Import a repository**
4. 授权 GitHub/GitLab，选择仓库
5. 项目名称：sitebox-backend
6. 构建命令：留空（Worker 项目一般不需要单独 build）
7. 部署命令：
    - 如果“路径”会设成 /backend：npm install && npx wrangler deploy
    - 如果“路径”是 /：cd backend && npm install && npx wrangler deploy
8. 非生产分支构建：建议先关掉（主分支稳定后再开）
9. 非生产分支部署命令（可选）：
    - 不需要预览版本就留空
    - 要预览可填：npx wrangler versions upload
10. 路径：建议填 /backend（这是关键，如果仓库是前后端在一起的情况，避免在仓库根目录执行命令,）
11. API 令牌：创建一个部署令牌
12. 令牌名称：sitebox-backend-deploy-token 或者使用现有的token
13. 变量名称：CLOUDFLARE_API_TOKEN
14. 变量值：你的 Cloudflare API Token 值,如果让新建，这里就不用填
    - 令牌权限建议至少包含：
        - Workers Scripts: Edit
        - D1: Edit
        - Account: Read
5. 配置 Worker 项目：
   - Root directory：`backend`
   - 入口：与项目一致（`server.mjs`）
6. 在项目设置中添加：
   - Variables：`DEPLOY_MODE=cloudflare`
   - D1 Binding：`DB` -> `sitebox`
7. 首次部署
8. 到 D1 控制台执行 `schema.sql`
9. 后续每次 push 自动触发部署

---

## 4. 常见问题

### Q1：为什么提示 D1 绑定要求 ES Module？

A：因为使用 D1 时，Worker 需要 ES Module 入口。当前项目已使用 `server.mjs`。

### Q2：前端能访问后端但数据为空？

A：大概率远程 D1 未导入 `schema.sql`，只初始化了本地模拟库。

### Q3：Cloudflare 模式下 Docker 实时接口报错？

A：这是平台能力限制，Cloudflare 运行环境不能直接访问你的宿主机 Docker daemon。

### Q4：需要把 `wrangler.toml` 放在仓库吗？

A：建议放。它是部署可复现配置。不要把 token / secret 写进去即可。

---

## 5. 给前端填写后端地址的建议

前端“后端地址设置”应填写：

- `https://<你的后端域名>`

不要填写：

- `https://<你的后端域名>/api`（会重复拼接）
- 不确定开放的端口（如误填 `:3000`）

系统会自动拼接 `/api`。
