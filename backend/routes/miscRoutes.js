// backend/routes/miscRoutes.js
const { Hono } = require('hono');
const miscController = require('../controllers/miscController');

const app = new Hono();

app.get('/status',              (c) => miscController.getStatus(c));
app.get('/help',                (c) => miscController.getHelp(c));
app.get('/gettings/siteName',   (c) => miscController.getSiteName(c));
app.post('/siteName',           (c) => miscController.updateSiteName(c));

module.exports = app;
