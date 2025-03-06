// backend/controllers/miscController.js
const miscService = require('../services/miscService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 获取系统状态
 */
const getStatus = async (req, res) => {
  try {
    const status = await miscService.getStatus();
    apiResponse.success(res, status);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 获取帮助文档
 */
const getHelp = async (req, res) => {
  try {
    const help = await miscService.getHelp();
    apiResponse.success(res, help);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新网站名称
 */
const updateSiteName = async (req, res) => {
    try {
        const { newSiteName } = req.body;
        console.log('newSiteName:', newSiteName);
        const result = await miscService.updateSiteName(newSiteName);
        apiResponse.success(res, result);
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};
/**
 * @description 获取网站名称
 */
const getSiteName = async (req, res) => {
  try {
      const siteName = await miscService.getSiteName();
      apiResponse.success(res, siteName);
  } catch (error) {
      apiResponse.error(res, error.message);
  }
};
module.exports = {
  getStatus,
  getHelp,
  updateSiteName,
  getSiteName
};

