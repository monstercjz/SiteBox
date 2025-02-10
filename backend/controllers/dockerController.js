// backend/controllers/dockerController.js
const dockerService = require('../services/dockerService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 获取 Docker 容器列表及详细信息
 */
const getContainers = async (req, res) => {
  try {
    const containers = await dockerService.getContainers();
    apiResponse.success(res, containers);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

module.exports = {
  getContainers,
};