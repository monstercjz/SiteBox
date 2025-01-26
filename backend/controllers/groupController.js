// backend/controllers/groupController.js
const groupService = require('../services/groupService');
const apiResponse = require('../utils/apiResponse');
const syncService = require('../services/syncService');
/**
 * @description 获取所有分组
 */
const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups();
    apiResponse.success(res, groups);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 创建新的分组
 */
const createGroup = async (req, res) => {
  try {
    const group = await groupService.createGroup(req.body);
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, group, 201);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取单个分组详情
 */
const getGroupById = async (req, res) => {
  try {
    const group = await groupService.getGroupById(req.params.groupId);
    if (!group) {
      return apiResponse.error(res, 'Group not found', 404);
    }
    apiResponse.success(res, group);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新分组信息
 */
const updateGroup = async (req, res) => {
  try {
    const group = await groupService.updateGroup(req.params.groupId, req.body);
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
 * @description 删除分组
 */
const deleteGroup = async (req, res) => {
  try {
    const group = await groupService.deleteGroup(req.params.groupId);
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
 * @description 分组排序
 */
const reorderGroups = async (req, res) => {
    try {
        const groups = await groupService.reorderGroups(req.body);
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