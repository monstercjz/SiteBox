const dockerController = require('../controllers/dockerController');
// backend/routes/dockerRoutes.js (简化后的代码)
const express = require('express');
const router = express.Router();

/**
 * @route GET /docker/containers
 * @description 获取 Docker 容器列表及详细信息
 */
router.get('/containers', dockerController.getContainers);

module.exports = router;