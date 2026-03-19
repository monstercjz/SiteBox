// backend/routes/websiteRoutes.js
const { Hono } = require('hono');
const websiteController = require('../controllers/websiteController');

const app = new Hono();

app.get('/',                                 (c) => websiteController.getAllWebsites(c));
app.get('/groups/:groupId/websites',         (c) => websiteController.getWebsitesByGroupId(c));
app.post('/groups/:groupId/websites',        (c) => websiteController.createWebsite(c));
app.get('/:websiteId',                       (c) => websiteController.getWebsiteById(c));
app.put('/:websiteId',                       (c) => websiteController.updateWebsite(c));
app.delete('/:websiteId',                    (c) => websiteController.deleteWebsite(c));
app.patch('/reorder',                        (c) => websiteController.reorderWebsites(c));
app.delete('/batch',                         (c) => websiteController.batchDeleteWebsites(c));
app.patch('/batch-move',                     (c) => websiteController.batchMoveWebsites(c));
app.post('/batch-import',                    (c) => websiteController.batchImportWebsites(c));
app.post('/batchImportWebsites',             (c) => websiteController.batchImportWebsites(c));

module.exports = app;
