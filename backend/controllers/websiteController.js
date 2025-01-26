// backend/controllers/websiteController.js
const websiteService = require('../services/websiteService');
const apiResponse = require('../utils/apiResponse');
const syncService = require('../services/syncService');

/**
 * @description 获取某个分组下的所有网站记录
 */
const getWebsitesByGroupId = async (req, res) => {
  try {
    const websites = await websiteService.getWebsitesByGroupId(req.params.groupId);
    apiResponse.success(res, websites);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 在某个分组下创建新的网站记录
 */
const createWebsite = async (req, res) => {
  try {
    const website = await websiteService.createWebsite(req.params.groupId, req.body);
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, website, 201);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取单个网站记录详情
 */
const getWebsiteById = async (req, res) => {
  try {
    const website = await websiteService.getWebsiteById(req.params.websiteId);
    if (!website) {
      return apiResponse.error(res, 'Website not found', 404);
    }
    apiResponse.success(res, website);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新网站记录信息
 */
const updateWebsite = async (req, res) => {
  try {
    const website = await websiteService.updateWebsite(req.params.websiteId, { ...req.body, groupId: req.body.groupId });
    if (!website) {
      return apiResponse.error(res, 'Website not found', 404);
    }
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, website);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 删除网站记录
 */
const deleteWebsite = async (req, res) => {
  try {
    const website = await websiteService.deleteWebsite(req.params.websiteId);
    if (!website) {
      return apiResponse.error(res, 'Website not found', 404);
    }
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, { message: 'Website deleted successfully' });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 网站记录排序
 */
const reorderWebsites = async (req, res) => {
    try {
        const websites = await websiteService.reorderWebsites(req.body);
        apiResponse.success(res, websites);
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

/**
 * @description 批量删除网站记录
 */
const batchDeleteWebsites = async (req, res) => {
    try {
        const result = await websiteService.batchDeleteWebsites(req.body.websiteIds);
        await syncService.backupData(); // 调用备份函数
        apiResponse.success(res, { message: `${result} websites deleted successfully` });
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

/**
 * @description 批量移动网站记录到其他分组
 */
const batchMoveWebsites = async (req, res) => {
    try {
        const result = await websiteService.batchMoveWebsites(req.body.websiteIds, req.body.targetGroupId);
        await syncService.backupData(); // 调用备份函数
        apiResponse.success(res, { message: `${result} websites moved successfully` });
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

/**
 * @description 批量导入网站
 */
const batchImportWebsites = async (req, res) => {
  try {
    const { websites, groupId } = req.body;
    const result = await websiteService.batchImportWebsites(websites, groupId);
    await syncService.backupData(); // 调用备份函数
    apiResponse.success(res, result);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取所有网站记录
 */
const getAllWebsites = async (req, res) => {
  console.log('getAllWebsites called');
  try {
    const websites = await websiteService.getAllWebsites();
    apiResponse.success(res, websites);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

module.exports = {
  getWebsitesByGroupId,
  createWebsite,
  getWebsiteById,
  updateWebsite,
  deleteWebsite,
  reorderWebsites,
  batchDeleteWebsites,
  batchMoveWebsites,
  batchImportWebsites,
  getAllWebsites
};
