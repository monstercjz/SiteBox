// backend/controllers/syncController.js
const syncService = require('../services/syncService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 导出数据
 */
const exportData = async (req, res) => {
  try {
    const data = await syncService.exportData();
    apiResponse.success(res, data);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 导入数据
 */
const importData = async (req, res) => {
  try {
    await syncService.importData(req.body);
    apiResponse.success(res, { message: 'Data imported successfully' });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 恢复到指定版本
 */
const restoreData = async (req, res) => {
    try {
        await syncService.restoreData(req.body.versionId);
        apiResponse.success(res, { message: 'Data restored successfully' });
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

/**
 * @description 移动网站到回收站
 */
const moveToTrash = async (req, res) => {
    try {
        const result = await syncService.moveToTrash(req.body.websiteIds);
        apiResponse.success(res, result);
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

module.exports = {
  exportData,
  importData,
  restoreData,
  moveToTrash
};
