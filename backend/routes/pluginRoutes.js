// backend/routes/pluginRoutes.js
const { Hono } = require('hono');
const pluginController = require('../controllers/pluginController');

const app = new Hono();

app.get('/extension/data',    (c) => pluginController.getExtensionData(c));
app.post('/extension/sync',   (c) => pluginController.syncBookmarks(c));
app.post('/extension/url',    (c) => pluginController.saveWebsiteUrl(c));

module.exports = app;
