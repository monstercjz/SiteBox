// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route GET /settings
 * @description 获取用户设置
 */
router.get('/settings', userController.getSettings);
/**
 * @route PUT /settings
 * @description 更新用户设置
 */
router.put('/settings', userController.updateSettings);
/**
 * @route POST /settings/icon
 * @description 上传自定义图标
 */
router.post('/settings/icon', userController.uploadIcon);

module.exports = router;