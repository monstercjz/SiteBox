// backend/controllers/websiteGroupController.js
const websiteGroupService = require('../services/websiteGroupService'); // 修改 service 引用
const apiResponse = require('../utils/apiResponse');
const syncService = require('../services/syncService');

/**
 * @description 获取所有网站分组
 */
const getAllGroups = async (req, res) => {
  try {
    const groups = await websiteGroupService.getAllGroups(); // 修改 service 调用
    apiResponse.success(res, groups);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 创建新的网站分组
 */
const createGroup = async (req, res) => {
  try {
    const group = await websiteGroupService.createGroup(req.body); // 修改 service 调用
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, group, 201);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取单个网站分组详情
 */
const getGroupById = async (req, res) => {
  try {
    const group = await websiteGroupService.getGroupById(req.params.groupId); // 修改 service 调用
    if (!group) {
      return apiResponse.error(res, 'Group not found', 404);
    }
    apiResponse.success(res, group);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新网站分组信息
 */
const updateGroup = async (req, res) => {
  try {
    const group = await websiteGroupService.updateGroup(req.params.groupId, req.body); // 修改 service 调用
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
 * @description 删除网站分组
 */
const deleteGroup = async (req, res) => {
  try {
    const group = await websiteGroupService.deleteGroup(req.params.groupId); // 修改 service 调用
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
 * @description 网站分组排序
 */
const reorderGroups = async (req, res) => {
    try {
        const groups = await websiteGroupService.reorderGroups(req.body); // 修改 service 调用
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