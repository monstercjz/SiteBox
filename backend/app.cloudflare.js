const { Hono } = require('hono');
const { cors } = require('hono/cors');

const websiteGroupRoutes = require('./routes/websiteGroupRoutes');
const dockerGroupRoutes = require('./routes/dockerGroupRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const searchRoutes = require('./routes/searchRoutes');
const syncRoutes = require('./routes/syncRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const pluginRoutes = require('./routes/pluginRoutes');
const miscRoutes = require('./routes/miscRoutes');

const app = new Hono();

app.use('*', cors());

app.route('/api/website-groups', websiteGroupRoutes);
app.route('/api/docker-groups', dockerGroupRoutes);
app.route('/api/websites', websiteRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/sync', syncRoutes);
app.route('/api/user', userRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/plugin', pluginRoutes);
app.route('/api/misc', miscRoutes);

app.get('/api/', (c) => c.text('Backend service is running'));

module.exports = app;
