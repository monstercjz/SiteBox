// backend/services/pluginService.js
const fileHandler = require('../utils/fileHandler');

const dataFilePath = 'backend/data/extensionData.json';

/**
 * @description 获取浏览器扩展数据
 */
const getExtensionData = async () => {
  try {
    const data = await fileHandler.readData(dataFilePath);
    return data || {};
  } catch (error) {
    return {};
  }
};

/**
 * @description 同步浏览器书签
 */
const syncBookmarks = async (bookmarks) => {
    // TODO: Implement bookmark sync logic
    console.log('Bookmarks synced:', bookmarks);
};

module.exports = {
  getExtensionData,
  syncBookmarks,
};