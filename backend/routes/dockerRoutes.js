// backend/routes/dockerRoutes.js
const { Hono } = require('hono');
const dockerController = require('../controllers/dockerController');

const app = new Hono();

app.get('/',                               (c) => dockerController.getAlldockers(c));
app.post('/',                              (c) => dockerController.createDocker(c));
app.get('/groups/:groupId/dockers',        (c) => dockerController.getdockersByGroupId(c));
app.post('/groups/:groupId/dockers',       (c) => dockerController.createDocker(c));

app.get('/real',                           (c) => dockerController.getAllServerRealdockerinfo(c));
app.get('/realdockerinfo',                 (c) => dockerController.getAllServerRealdockerinfo(c));
app.get('/real/records',                   (c) => dockerController.getRecordRealdockerinfo(c));
app.get('/realdockerinfobyId/:dockerId',   (c) => dockerController.getRealdockerinfobyId(c));

app.get('/:dockerId',                      (c) => dockerController.getdockerById(c));
app.put('/:dockerId',                      (c) => dockerController.updateDocker(c));
app.delete('/:dockerId',                   (c) => dockerController.deleteDocker(c));
app.get('/:dockerItemId/real',             (c) => dockerController.getRealdockerinfobyId(c));
app.post('/:dockerItemId/start',           (c) => dockerController.startDocker(c));
app.post('/:dockerItemId/stop',            (c) => dockerController.stopDocker(c));
app.post('/:dockerItemId/restart',         (c) => dockerController.restartDocker(c));
app.post('/:dockerId/start',               (c) => dockerController.startDocker(c));
app.post('/:dockerId/stop',                (c) => dockerController.stopDocker(c));
app.post('/:dockerId/restart',             (c) => dockerController.restartDocker(c));

module.exports = app;
