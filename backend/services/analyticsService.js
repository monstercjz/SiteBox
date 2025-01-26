// backend/services/analyticsService.js
const fileHandler = require('../utils/fileHandler');
const { WEBSITE_DATA_FILE_PATH } = require('../config/constants');

/**
 * @description 更新网站的最后访问时间
 * @param {string} websiteId - 网站ID
 */
const updateLastClickTime = async (websiteId) => {
  try {
    // 读取网站数据
    const data = await fileHandler.readData(WEBSITE_DATA_FILE_PATH);
    
    // 查找并更新对应网站的最后访问时间
    const website = data.websites.find(w => w.id === websiteId);
    if (website) {
      // 获取北京时间（UTC+8）
      const now = new Date();
      const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      website.lastAccessTime = beijingTime.toISOString();
      
      await fileHandler.writeData(WEBSITE_DATA_FILE_PATH, data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating website last access time:', error);
    throw error;
  }
};

module.exports = {
  updateLastClickTime
};
