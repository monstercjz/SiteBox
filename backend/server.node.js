// backend/server.node.js
// Docker / 本地 Node.js 部署入口
// 启动方式: node server.node.js
// 使用 better-sqlite3 作为本地 SQLite 存储，接口与 CF D1 一致

const { serve } = require('@hono/node-server');
const { serveStatic } = require('@hono/node-server/serve-static');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'db', 'sitebox.db');

// 确保 data 目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化 better-sqlite3 并执行建表 SQL
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 标记为 better-sqlite3，区别于 D1
db.__isBetterSqlite3 = true;

// 读取并执行 schema.sql 初始化表结构
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database schema initialized.');
}

// 构造 nodeEnv，模拟 CF Workers 的 env 对象
const nodeEnv = {
  DB: db,
  DEPLOY_MODE: 'docker',
};

// 提供静态文件
app.use('/api/data/*', serveStatic({
    root: './',
    rewriteRequestPath: (path) => path.replace(/^\/api/, '')
}));

// 启动服务，将 nodeEnv 注入每个请求
serve({
  fetch: (req) => app.fetch(req, nodeEnv),
  port: PORT,
}, (info) => {
  console.log(`SiteBox backend (Docker mode) running on http://localhost:${info.port}`);
});
