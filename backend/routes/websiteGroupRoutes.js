// backend/routes/websiteGroupRoutes.js
const { Hono } = require('hono');
const websiteGroupController = require('../controllers/websiteGroupController');

const app = new Hono();

app.get('/',            (c) => websiteGroupController.getAllGroups(c));
app.post('/',           (c) => websiteGroupController.createGroup(c));
app.get('/:groupId',    (c) => websiteGroupController.getGroupById(c));
app.put('/:groupId',    (c) => websiteGroupController.updateGroup(c));
app.delete('/:groupId', (c) => websiteGroupController.deleteGroup(c));
app.patch('/reorder',   (c) => websiteGroupController.reorderGroups(c));

module.exports = app;
