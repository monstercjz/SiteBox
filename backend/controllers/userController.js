// backend/controllers/userController.js
const userService = require('../services/userService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 获取用户设置
 */
const getSettings = async (req, res) => {
  try {
    const settings = await userService.getSettings();
    apiResponse.success(res, settings);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 更新用户设置
 */
const updateSettings = async (req, res) => {
  try {
    const settings = await userService.updateSettings(req.body);
    apiResponse.success(res, settings);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 上传自定义图标
 */
const uploadIcon = async (req, res) => {
    try {
        // TODO: Implement icon upload logic
        apiResponse.success(res, { message: 'Icon uploaded successfully' });
    } catch (error) {
        apiResponse.error(res, error.message);
    }
};

module.exports = {
  getSettings,
  updateSettings,
  uploadIcon
};