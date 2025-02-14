
// backend/routes/dockerRoutes.js (简化后的代码)
const express = require('express');
const router = express.Router();
const dockerController = require('../controllers/dockerController');

/**
 * @route GET /dockers
 * @description 获取所有docker记录
 */
router.get('/', dockerController.getAlldockers);

/**
 * @route GET /groups/:groupId/dockers
 * @description 获取某个分组下的所有docker记录
 */
router.get('/groups/:groupId/dockers', dockerController.getdockersByGroupId);
/**
 * @route POST /groups/:groupId/dockers
 * @description 在某个分组下创建新的docker记录
 */
router.post('/groups/:groupId/dockers', dockerController.createDocker);
/**
 * @route GET /dockers/:dockerId
 * @description 获取单个docker记录详情
 */
router.get('/:dockerId', dockerController.getdockerById);
/**
 * @route PUT /dockers/:dockerId
 * @description 更新docker记录信息
 */
router.put('/:dockerId', dockerController.updateDocker);
/**
 * @route DELETE /dockers/:dockerId
 * @description 删除docker记录
 */
router.delete('/:dockerId', dockerController.deleteDocker);
/**
 * @route get /realdockerinfo
 * @description 渲染全部dockercontainer实时信息
 */
router.get('/realdockerinfo', dockerController.getRealdockerinfo);

/**
 * @route get /realdockerinfo/:dockerId
 * @description 渲染单个dockercontainer实时信息
 */
router.get('/realdockerinfo/:dockerId', dockerController.getRealdockerinfobyId);

module.exports = router;