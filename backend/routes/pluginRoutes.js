// backend/routes/pluginRoutes.js
const express = require('express');
const router = express.Router();
const pluginController = require('../controllers/pluginController');

/**
 * @route GET /extension/data
 * @description 获取浏览器扩展数据
 */
router.get('/extension/data', pluginController.getExtensionData);
/**
 * @route POST /extension/sync
 * @description 同步浏览器书签
 */
router.post('/extension/sync', pluginController.syncBookmarks);

module.exports = router;