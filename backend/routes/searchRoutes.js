// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * @route GET /search
 * @description 根据关键词搜索分组和网站记录
 */
router.get('/', searchController.search);

module.exports = router;