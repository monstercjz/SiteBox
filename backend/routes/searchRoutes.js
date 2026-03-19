// backend/routes/searchRoutes.js
const { Hono } = require('hono');
const searchController = require('../controllers/searchController');

const app = new Hono();

app.get('/', (c) => searchController.search(c));

module.exports = app;
