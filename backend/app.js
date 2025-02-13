// backend/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// Middleware
app.use(express.json());
app.use(cors());
// 配置静态文件服务
app.use('/api/data/icons', express.static(path.join(__dirname, 'data', 'icons')));
// Routes
const websiteGroupRoutes = require('./routes/websiteGroupRoutes'); // 网站分组路由
app.use('/api/website-groups', websiteGroupRoutes); // 网站分组路由，路径保持不变

const dockerGroupRoutes = require('./routes/dockerGroupRoutes'); // Docker 容器分组路由
app.use('/api/docker-groups', dockerGroupRoutes); // Docker 容器分组路由，新路径 /api/docker-groups

const websiteRoutes = require('./routes/websiteRoutes');
app.use('/api/websites', websiteRoutes);

const searchRoutes = require('./routes/searchRoutes');
app.use('/api/search', searchRoutes);

const syncRoutes = require('./routes/syncRoutes');
app.use('/api/sync', syncRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const pluginRoutes = require('./routes/pluginRoutes');
app.use('/api/plugin', pluginRoutes);

const miscRoutes = require('./routes/miscRoutes');
app.use('/api/misc', miscRoutes);
// 添加 dockerRoutes
const dockerRoutes = require('./routes/dockerRoutes');
app.use('/api/dockers', dockerRoutes);

app.get('/api/', (req, res) => {
  res.send('Backend service is running');
});

module.exports = app;