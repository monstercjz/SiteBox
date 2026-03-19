// backend/services/pluginService.js
const { queryAll } = require('../utils/fileHandler');
const websiteService = require('./websiteService');

/**
 * 获取浏览器扩展数据（返回所有分组和网站）
 */
const getExtensionData = async (env) => {
  try {
    const groups = await queryAll(
      env,
      "SELECT * FROM groups WHERE group_type = 'website-group' ORDER BY order_index ASC"
    );
    const websites = await queryAll(
      env,
      'SELECT * FROM websites ORDER BY order_index ASC'
    );
    return { groups, websites };
  } catch (error) {
    console.error('Error getting extension data:', error);
    return { groups: [], websites: [] };
  }
};

/**
 * 同步浏览器书签（占位实现）
 */
const syncBookmarks = async (env, bookmarks) => {
  // TODO: 实现书签同步逻辑
  console.log('Bookmarks synced:', bookmarks);
  return { message: 'Bookmarks sync received', count: bookmarks ? bookmarks.length : 0 };
};

/**
 * 从浏览器插件保存网站 URL
 */
const saveWebsiteUrl = async (env, url, title, description, groupId) => {
  try {
    const websiteData = {
      name: title || 'New Website',
      url,
      description: description || '',
    };
    const result = await websiteService.createWebsite(env, groupId || 'default-group', websiteData);
    return result;
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
