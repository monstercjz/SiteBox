// backend/services/searchService.js
const { queryAll } = require('../utils/fileHandler');

/**
 * 根据关键词搜索分组和网站
 */
const search = async (env, keyword) => {
  if (!keyword || keyword.trim() === '') return [];

  const likeKeyword = `%${keyword}%`;

  const [groups, websites] = await Promise.all([
    queryAll(
      env,
      "SELECT * FROM groups WHERE name LIKE ? AND group_type = 'website-group'",
      [likeKeyword]
    ),
    queryAll(
      env,
      'SELECT * FROM websites WHERE name LIKE ? OR url LIKE ?',
      [likeKeyword, likeKeyword]
    ),
  ]);

  const results = [
    ...groups.map(g => ({
      type: 'group',
      id: g.id,
      name: g.name,
      groupType: g.group_type,
      dashboardType: g.dashboard_type,
    })),
    ...websites.map(w => ({
      type: 'website',
      id: w.id,
      groupId: w.group_id,
      name: w.name,
      url: w.url,
      description: w.description,
      faviconUrl: w.favicon_url,
    })),
  ];

  return results;
};

module.exports = {
  search,
};
