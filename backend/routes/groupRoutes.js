// backend/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

/**
 * @route GET /groups
 * @description 获取所有分组
 */
router.get('/', groupController.getAllGroups);
/**
 * @route POST /groups
 * @description 创建新的分组
 */
router.post('/', groupController.createGroup);
/**
 * @route GET /groups/:groupId
 * @description 获取单个分组详情
 */
router.get('/:groupId', groupController.getGroupById);
/**
 * @route PUT /groups/:groupId
 * @description 更新分组信息
 */
router.put('/:groupId', groupController.updateGroup);
/**
 * @route DELETE /groups/:groupId
 * @description 删除分组
 */
router.delete('/:groupId', groupController.deleteGroup);
/**
 * @route PATCH /groups/reorder
 * @description 分组排序
 */
router.patch('/reorder', groupController.reorderGroups);

module.exports = router;