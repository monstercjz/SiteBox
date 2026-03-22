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
GITHUB_TOKEN=
GITHUB_REPO=
GITHUB_PATH=
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

---

## 一、“自动部署页”这样填

> 下面给两种写法，二选一（推荐 A）

### A. 路径填 `/backend`（推荐）

- **项目名称**：`sitebox-backend`
- **构建命令**：留空
- **部署命令**：

  ```bash
  npm install && npx wrangler deploy server.mjs --name sitebox-backend --compatibility-date=2024-01-01
  ```

- **非生产分支构建**：先关掉（稳定后再开）
- **高级设置 → 路径**：`/backend`
- **API 令牌**：创建并注入 `CLOUDFLARE_API_TOKEN`或者使用已经存在的token
  - 令牌权限建议至少包含：
  - Workers Scripts: Edit
  - D1: Edit
  - Account: Read

### B. 路径填 `/`（仓库根）

- **项目名称**：`sitebox-backend`
- **构建命令**：留空
- **部署命令**：

  ```bash
  npm --prefix backend install && npx wrangler deploy backend/server.mjs --name sitebox-backend --compatibility-date=2024-01-01
  ```

- **高级设置 → 路径**：`/`
- **API 令牌**：同上

---

## 二、Cloudflare Dashboard 里手动补配置（没有 .toml 必做）

部署命令只负责上传代码，`D1 绑定/变量` 你要在 Cloudflare 控制台补齐：

1. 打开 **Cloudflare Dashboard**
2. 进 **Workers & Pages** → 选你的 Worker（`sitebox-backend`）
3. **Settings → Variables**
   - 新增：
     - 名称：`DEPLOY_MODE`
     - 值：`cloudflare`
     - 名称：`GITHUB_TOKEN`
     - 值：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - 名称：`GITHUB_REPO`
     - 值：`xxxxx/yyyyy`
     - 名称：`GITHUB_PATH`
     - 值：`backup_json/backup.json`
4. **Settings → Bindings**
   - 新增 D1 绑定：
     - Binding 名：`DB`
     - 选择数据库：`sitebox`（你已有的那个）
5. **Settings → Runtime / Compatibility**（不同界面名字略有差异）
   - Compatibility date：`2024-01-01`
   - Compatibility flags：`nodejs_compat`


---

## 三、初始化数据库（必须）

即使部署成功，没建表也会出问题。
去 **D1 控制台** 选 `sitebox` 数据库，执行 `backend/schema.sql` 的 SQL（整份执行一次）。
> **重要说明**，如果没有toml文件，即便绑定了数据库或者设置了变量，下次自动部署的时候这个绑定也会失效
> 建议在仓库中添加一个toml文件，修改自己对应的db名字和id
> 如果有toml文件，即便不手动补配置也能正常运行

---

## 四、验证

- 打开：
  `https://<你的worker域名>/api/`
- 预期：
  `Backend service is running`
- 直接访问这两个接口验证：

- https://siteback.nuaa.dpdns.org/api/website-groups
- https://siteback.nuaa.dpdns.org/api/websites
- 预期要返回 JSON（success/data），不能再报 prepare 错误。

---

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
