// backend/controllers/dockerGroupController.js
const dockerGroupService = require('../services/dockerGroupService');
const apiResponse = require('../utils/apiResponse');
const syncService = require('../services/syncService');

/**
 * @description 获取所有 Docker 容器分组
 */
const getAllGroups = async (req, res) => {
  try {
    const groups = await dockerGroupService.getAllGroups();
    apiResponse.success(res, groups);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 创建新的 Docker 容器分组
 */
const createGroup = async (req, res) => {
  try {
    const group = await dockerGroupService.createGroup(req.body);
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, group, 201);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取单个 Docker 容器分组详情
 */
const getGroupById = async (req, res) => {
  try {
    const group = await dockerGroupService.getGroupById(req.params.groupId);
    if (!group) {
      return apiResponse.error(res, 'Group not found', 404);
    }
    apiResponse.success(res, group);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新 Docker 容器分组信息
 */
const updateGroup = async (req, res) => {
  try {
    const group = await dockerGroupService.updateGroup(req.params.groupId, req.body);
    if (!group) {
      return apiResponse.error(res, 'Group not found', 404);
    }
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, group);
  } catch (error) {
     apiResponse.error(res, error.message);
  }
};

/**
 * @description 删除 Docker 容器分组
 */
const deleteGroup = async (req, res) => {
  try {
    const group = await dockerGroupService.deleteGroup(req.params.groupId);
    if (!group) {
      return apiResponse.error(res, 'Group not found', 404);
    }
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, { message: 'Group deleted successfully' });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description Docker 容器分组排序
 */
const reorderGroups = async (req, res) => {
    try {
        const groups = await dockerGroupService.reorderGroups(req.body);
        apiResponse.success(res, groups);
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

module.exports = {
  getAllGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  reorderGroups
};