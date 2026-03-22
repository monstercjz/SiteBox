// backend/routes/syncRoutes.js
const { Hono } = require('hono');
const syncController = require('../controllers/syncController');

const app = new Hono();

app.get('/export',              (c) => syncController.exportData(c));
app.post('/import',             (c) => syncController.importData(c));
app.get('/backups',             (c) => syncController.listBackups(c));
app.post('/history/restore',    (c) => syncController.restoreData(c));
app.post('/moveToTrash',        (c) => syncController.moveToTrash(c));
app.get('/history',             (c) => syncController.getHistory(c));
app.post('/cloud-sync',         (c) => syncController.cloudSync(c));

module.exports = app;
