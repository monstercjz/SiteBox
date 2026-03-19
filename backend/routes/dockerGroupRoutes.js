// backend/routes/dockerGroupRoutes.js
const { Hono } = require('hono');
const dockerGroupController = require('../controllers/dockerGroupController');

const app = new Hono();

app.get('/',            (c) => dockerGroupController.getAllGroups(c));
app.post('/',           (c) => dockerGroupController.createGroup(c));
app.get('/:groupId',    (c) => dockerGroupController.getGroupById(c));
app.put('/:groupId',    (c) => dockerGroupController.updateGroup(c));
app.delete('/:groupId', (c) => dockerGroupController.deleteGroup(c));
app.patch('/reorder',   (c) => dockerGroupController.reorderGroups(c));

module.exports = app;
