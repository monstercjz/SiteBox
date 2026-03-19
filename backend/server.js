// backend/server.js
// Cloudflare Workers 入口文件
// 部署方式: wrangler deploy 或 通过 Cloudflare Pages Git 集成

const app = require('./app');

// CF Workers fetch handler
module.exports = {
  fetch: app.fetch.bind(app),
};
