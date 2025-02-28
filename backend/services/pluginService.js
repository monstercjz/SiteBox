// backend/services/pluginService.js
const fileHandler = require('../utils/fileHandler');

const { WEBSITE_DATA_FILE_PATH } = require('../config/constants');

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
const sitesDataFilePath = 'data/sites-data.json';

/**
 * @description 保存网站URL到sites-data.json，添加到websites数组, 包含更多网站信息
 */
const websiteService = require('./websiteService');

const saveWebsiteUrl = async (url, title, description, groupId) => {
  try {
    const websiteData = {
      name: title || 'New Website',
      url: url,
      description: description || '',
      // faviconUrl: 'https://www.google.com/s2/favicons?sz=64&domain_url=' + new URL(url).hostname, // 使用 Google Favicon API 作为默认值, 使用 hostname
    };
    await websiteService.createWebsite(groupId || 'default-group', websiteData);
  } catch (error) {
    console.error('Error saving website URL:', error);
    throw new Error('Failed to save website URL: ' + error.message);
  }
};

module.exports = {
  getExtensionData,
  syncBookmarks,
  saveWebsiteUrl,
};