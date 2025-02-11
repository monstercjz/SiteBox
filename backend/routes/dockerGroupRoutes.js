// backend/routes/dockerGroupRoutes.js
const express = require('express');
const router = express.Router();
const dockerGroupController = require('../controllers/dockerGroupController'); // 引用 dockerGroupController

/**
 * @route GET /docker-groups
 * @description 获取所有 Docker 容器分组
 */
router.get('/', dockerGroupController.getAllGroups); // 使用 dockerGroupController
/**
 * @route POST /docker-groups
 * @description 创建新的 Docker 容器分组
 */
router.post('/', dockerGroupController.createGroup); // 使用 dockerGroupController
/**
 * @route GET /docker-groups/:groupId
 * @description 获取单个 Docker 容器分组详情
 */
router.get('/:groupId', dockerGroupController.getGroupById); // 使用 dockerGroupController
/**
 * @route PUT /docker-groups/:groupId
 * @description 更新 Docker 容器分组信息
 */
router.put('/:groupId', dockerGroupController.updateGroup); // 使用 dockerGroupController
/**
 * @route DELETE /docker-groups/:groupId
 * @description 删除 Docker 容器分组
 */
router.delete('/:groupId', dockerGroupController.deleteGroup); // 使用 dockerGroupController
/**
 * @route PATCH /docker-groups/reorder
 * @description Docker 容器分组排序
 */
router.patch('/reorder', dockerGroupController.reorderGroups); // 使用 dockerGroupController

module.exports = router;