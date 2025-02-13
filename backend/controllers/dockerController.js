// backend/controllers/dockerController.js
const dockerService = require('../services/dockerService');
const apiResponse = require('../utils/apiResponse');

/**
 * @route GET /dockers
 * @description 获取所有 Docker 记录 
 */
const getAlldockers = async (req, res) => {
  try {
    const dockers = await dockerService.getAlldockers();
    apiResponse.success(res, dockers);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @route GET /groups/:groupId/dockers
 * @description 获取某个分组下的所有 Docker 记录 
 */
const getdockersByGroupId = async (req, res) => {
  try {
    const { groupId } = req.params;
    const dockers = await dockerService.getdockersByGroupId(groupId); // 调用新的服务函数
    apiResponse.success(res, dockers);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @route POST /groups/:groupId/dockers
 * @description 创建 Docker 记录 
 */
const createDocker = async (req, res) => {
  try {
    const { groupId } = req.params;
        const { dockerData } = req.body;
    const newDocker = await dockerService.createDocker(groupId, dockerData);
    apiResponse.success(res, newDocker, 201); // 201 Created
  } catch (error) {
    apiResponse.error(res, error.message, 400); // 400 Bad Request
  }
};

/**
 * @route GET /dockers/:dockerId
 * @description 获取单个 Docker 记录详情 
 */
const getdockerById = async (req, res) => {
  try {
    const { dockerId } = req.params;
    const docker = await dockerService.getdockerById(dockerId); // 调用 getStoredDockerById 获取存储记录详情
    if (docker) {
      apiResponse.success(res, docker);
    } else {
      apiResponse.error(res, 'Docker 记录未找到', 404); // 404 Not Found
    }
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @route PUT /dockers/:dockerId
 * @description 更新 Docker 记录 
 */
const updateDocker = async (req, res) => {
  try {
    const { dockerId } = req.params;
    const { dockerData } = req.body;
    const updatedDocker = await dockerService.updateDocker(dockerId, dockerData);
    apiResponse.success(res, updatedDocker);
  } catch (error) {
    apiResponse.error(res, error.message, 400); // 400 Bad Request
  }
};

/**
 * @route DELETE /dockers/:dockerId
 * @description 删除 Docker 记录 
 */
const deleteDocker = async (req, res) => {
  try {
    const { dockerId } = req.params;
    const result = await dockerService.deleteDocker(dockerId);
    apiResponse.success(res, result, 200, 'Docker 记录删除成功');
  } catch (error) {
    apiResponse.error(res, error.message, 400); // 400 Bad Request
  }
};

/**
 * @route GET /realdockerinfo
 * @description 获取所有 Docker 容器实时信息 
 */
const getRealdockerinfo = async (req, res) => {
  try {
    const containers = await dockerService.getRealdockerinfo(); // 调用修改后的服务函数名
    apiResponse.success(res, containers);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @route GET /realdockerinfo/:dockerId
 * @description 获取单个 Docker 容器实时信息 
 */
const getRealdockerinfobyId = async (req, res) => {
  try {
    const { dockerId } = req.params;
    const containerInfo = await dockerService.getRealdockerinfobyId(dockerId); // 调用修改后的服务函数名
    apiResponse.success(res, containerInfo);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};


module.exports = {
  getAlldockers,
  getdockersByGroupId,
  createDocker,
  getdockerById,
  updateDocker,
  deleteDocker,
  getRealdockerinfo,
  getRealdockerinfobyId,
};