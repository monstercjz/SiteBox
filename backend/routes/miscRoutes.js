// backend/routes/miscRoutes.js
const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');

/**
 * @route GET /status
 * @description 获取系统状态
 */
router.get('/status', miscController.getStatus);
/**
 * @route GET /help
 * @description 获取帮助文档
 */
router.get('/help', miscController.getHelp);

/**
 * @route POST /misc/siteName
 * @description 更新网站名称
 */
router.post('/siteName', miscController.updateSiteName);

module.exports = router;