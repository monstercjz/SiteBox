// backend/routes/syncRoutes.js
const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const websiteController = require('../controllers/websiteController');

/**
 * @route GET /export
 * @description 导出数据
 */
router.get('/export', syncController.exportData);
/**
 * @route POST /import
 * @description 导入数据
 */
router.post('/import', syncController.importData);
/**
 * @route POST /history/restore
 * @description 恢复到指定版本
 */
router.post('/history/restore', syncController.restoreData);
/**
 * @route POST /moveToTrash
 * @description 记录网站信息
 * @body {websiteIds: string[]}
 */
router.post('/moveToTrash', syncController.moveToTrash);



module.exports = router;
