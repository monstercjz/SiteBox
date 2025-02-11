// backend/routes/websiteGroupRoutes.js
const express = require('express');
const router = express.Router();
const websiteGroupController = require('../controllers/websiteGroupController'); // 修改 controller 引用

/**
 * @route GET /groups
 * @description 获取所有网站分组
 */
router.get('/', websiteGroupController.getAllGroups); // 修改 controller 调用
/**
 * @route POST /groups
 * @description 创建新的网站分组
 */
router.post('/', websiteGroupController.createGroup); // 修改 controller 调用
/**
 * @route GET /groups/:groupId
 * @description 获取单个网站分组详情
 */
router.get('/:groupId', websiteGroupController.getGroupById); // 修改 controller 调用
/**
 * @route PUT /groups/:groupId
 * @description 更新网站分组信息
 */
router.put('/:groupId', websiteGroupController.updateGroup); // 修改 controller 调用
/**
 * @route DELETE /groups/:groupId
 * @description 删除网站分组
 */
router.delete('/:groupId', websiteGroupController.deleteGroup); // 修改 controller 调用
/**
 * @route PATCH /groups/reorder
 * @description 网站分组排序
 */
router.patch('/reorder', websiteGroupController.reorderGroups); // 修改 controller 调用

module.exports = router;