// backend/services/analyticsService.js
const { execSQL, queryOne, queryAll } = require('../utils/fileHandler');

/**
 * 更新网站的最后访问时间
 */
const updateLastClickTime = async (env, websiteId) => {
  try {
    const now = new Date().toISOString();
    const { changes } = await execSQL(
      env,
      'UPDATE websites SET last_access_time = ? WHERE id = ?',
      [now, websiteId]
    );
    return changes > 0;
  } catch (error) {
    console.error('Error updating website last access time:', error);
    throw error;
  }
};

/**
 * 获取访问统计（按最后访问时间倒序，取前 N 条）
 */
const getAnalytics = async (env, limit = 20) => {
  try {
    const rows = await queryAll(
      env,
      'SELECT id, name, url, favicon_url, last_access_time FROM websites WHERE last_access_time IS NOT NULL ORDER BY last_access_time DESC LIMIT ?',
      [limit]
    );
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      url: r.url,
      faviconUrl: r.favicon_url,
      lastAccessTime: r.last_access_time,
    }));
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
};

module.exports = {
  updateLastClickTime,
  getAnalytics,
};
