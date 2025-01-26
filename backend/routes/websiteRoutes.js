// backend/routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

/**
 * @route GET /websites
 * @description 获取所有网站记录
 */
router.get('/', websiteController.getAllWebsites);
/**
 * @route DELETE /websites/batch
 * @description 批量删除网站记录
 */
router.delete('/batch', websiteController.batchDeleteWebsites);
/**
 * @route PATCH /websites/batch-move
 * @description 批量移动网站记录到其他分组
 */
router.patch('/batch-move', websiteController.batchMoveWebsites);
/**
 * @route GET /groups/:groupId/websites
 * @description 获取某个分组下的所有网站记录
 */
router.get('/groups/:groupId/websites', websiteController.getWebsitesByGroupId);
/**
 * @route POST /groups/:groupId/websites
 * @description 在某个分组下创建新的网站记录
 */
router.post('/groups/:groupId/websites', websiteController.createWebsite);
/**
 * @route GET /websites/:websiteId
 * @description 获取单个网站记录详情
 */
router.get('/:websiteId', websiteController.getWebsiteById);
/**
 * @route PUT /websites/:websiteId
 * @description 更新网站记录信息
 */
router.put('/:websiteId', websiteController.updateWebsite);
/**
 * @route DELETE /websites/:websiteId
 * @description 删除网站记录
 */
router.delete('/:websiteId', websiteController.deleteWebsite);
/**
 * @route POST /batchImportWebsites
 * @description 批量导入网站
 * @body {websites: Array, groupId: string}
 */
router.post('/batchImportWebsites', websiteController.batchImportWebsites);//虽然挂载在sync路由下，但是这个路由是websiteController下的路由


module.exports = router;