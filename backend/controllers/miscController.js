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

module.exports = {
  getStatus,
  getHelp,
};