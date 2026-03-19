// backend/controllers/userController.js
const userService = require('../services/userService');
const apiResponse = require('../utils/apiResponse');

const getSettings = async (c) => {
  try {
    const env = c.env;
    const settings = await userService.getSettings(env);
    return apiResponse.success(c, settings);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const updateSettings = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const settings = await userService.updateSettings(env, body);
    return apiResponse.success(c, settings);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

/**
 * 上传自定义图标（Cloudflare 模式下不支持文件上传到本地，返回提示）
 */
const uploadIcon = async (c) => {
  return apiResponse.error(c, '自定义图标上传在 Cloudflare 模式下暂不支持，请使用外部 URL', 501);
};

module.exports = { getSettings, updateSettings, uploadIcon };
