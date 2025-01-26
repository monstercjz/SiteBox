// backend/app.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
// Middleware
app.use(express.json());
app.use(cors());
// 配置静态文件服务
app.use('/data/icons', express.static(path.join(__dirname, 'data', 'icons')));
// Routes
const groupRoutes = require('./routes/groupRoutes');
app.use('/groups', groupRoutes);

const websiteRoutes = require('./routes/websiteRoutes');
app.use('/websites', websiteRoutes);

const searchRoutes = require('./routes/searchRoutes');
app.use('/search', searchRoutes);

const syncRoutes = require('./routes/syncRoutes');
app.use('/sync', syncRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/analytics', analyticsRoutes);

const pluginRoutes = require('./routes/pluginRoutes');
app.use('/plugin', pluginRoutes);

const miscRoutes = require('./routes/miscRoutes');
app.use('/misc', miscRoutes);

app.get('/', (req, res) => {
  res.send('Backend service is running');
});

module.exports = app;