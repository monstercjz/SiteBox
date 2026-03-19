// backend/routes/userRoutes.js
const { Hono } = require('hono');
const userController = require('../controllers/userController');

const app = new Hono();

app.get('/settings',      (c) => userController.getSettings(c));
app.put('/settings',      (c) => userController.updateSettings(c));
app.post('/settings/icon',(c) => userController.uploadIcon(c));

module.exports = app;
