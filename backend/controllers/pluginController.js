// backend/controllers/pluginController.js
const pluginService = require('../services/pluginService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 获取浏览器扩展数据
 */
const getExtensionData = async (req, res) => {
  try {
    const data = await pluginService.getExtensionData();
    apiResponse.success(res, data);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

/**
 * @description 同步浏览器书签
 */
const syncBookmarks = async (req, res) => {
  try {
    await pluginService.syncBookmarks(req.body);
    apiResponse.success(res, { message: 'Bookmarks synced successfully' });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};
/**
 * @description 接收并保存浏览器插件发送的URL
 */
const saveWebsiteUrl = async (req, res) => {
  try {
    const { url, title, description, groupId } = req.body; // 从请求体中获取 url, title, description, groupId
    await pluginService.saveWebsiteUrl(url, title, description, groupId); // 传递 title, description, groupId
    apiResponse.success(res, { message: 'URL saved successfully' });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

module.exports = {
  getExtensionData,
  syncBookmarks,
  saveWebsiteUrl,
};