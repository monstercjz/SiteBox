// backend/routes/analyticsRoutes.js
const { Hono } = require('hono');
const analyticsController = require('../controllers/analyticsController');

const app = new Hono();

app.post('/click', (c) => analyticsController.recordClick(c));
app.get('/',       (c) => analyticsController.getAnalytics(c));

module.exports = app;
