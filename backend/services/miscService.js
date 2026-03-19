// backend/services/miscService.js
const { getSetting, setSetting } = require('./userService');

/**
 * 获取系统状态
 */
const getStatus = async () => {
  return { status: 'ok' };
};

/**
 * 获取帮助文档
 */
const getHelp = async () => {
  return {
    message: 'This is the help documentation for the API.',
    endpoints: [
      { method: 'GET',    path: '/api/groups',                                    description: 'Get all groups' },
      { method: 'POST',   path: '/api/groups',                                    description: 'Create a new group' },
      { method: 'GET',    path: '/api/groups/:groupId',                            description: 'Get a group by ID' },
      { method: 'PUT',    path: '/api/groups/:groupId',                            description: 'Update a group' },
      { method: 'DELETE', path: '/api/groups/:groupId',                            description: 'Delete a group' },
      { method: 'PATCH',  path: '/api/groups/reorder',                             description: 'Reorder groups' },
      { method: 'GET',    path: '/api/websites',                                   description: 'Get all websites' },
      { method: 'GET',    path: '/api/websites/groups/:groupId/websites',          description: 'Get all websites in a group' },
      { method: 'POST',   path: '/api/websites/groups/:groupId/websites',          description: 'Create a new website in a group' },
      { method: 'GET',    path: '/api/websites/:websiteId',                        description: 'Get a website by ID' },
      { method: 'PUT',    path: '/api/websites/:websiteId',                        description: 'Update a website' },
      { method: 'DELETE', path: '/api/websites/:websiteId',                        description: 'Delete a website' },
      { method: 'PATCH',  path: '/api/websites/reorder',                           description: 'Reorder websites' },
      { method: 'DELETE', path: '/api/websites/batch',                             description: 'Batch delete websites' },
      { method: 'PATCH',  path: '/api/websites/batch-move',                        description: 'Batch move websites to another group' },
      { method: 'GET',    path: '/api/search?keyword=xxx',                         description: 'Search groups and websites' },
      { method: 'GET',    path: '/api/sync/export',                                description: 'Export all data' },
      { method: 'POST',   path: '/api/sync/import',                                description: 'Import data' },
      { method: 'POST',   path: '/api/sync/history/restore',                       description: 'Restore data to a specific version' },
      { method: 'GET',    path: '/api/settings',                                   description: 'Get user settings' },
      { method: 'PUT',    path: '/api/settings',                                   description: 'Update user settings' },
      { method: 'GET',    path: '/api/analytics',                                  description: 'Get website access analytics' },
      { method: 'GET',    path: '/api/extension/data',                             description: 'Get browser extension data' },
      { method: 'POST',   path: '/api/extension/sync',                             description: 'Sync browser bookmarks' },
      { method: 'GET',    path: '/api/status',                                     description: 'Get server status' },
      { method: 'GET',    path: '/api/help',                                       description: 'Get API documentation' },
      { method: 'POST',   path: '/api/sync/moveToTrash',                           description: 'Move website to trash' },
    ],
  };
};

/**
 * 更新网站名称
 */
const updateSiteName = async (env, newSiteName) => {
  try {
    await setSetting(env, 'siteName', newSiteName);
    console.log('Updated site name:', newSiteName);
    return { message: 'Site name updated successfully', newSiteName };
  } catch (error) {
    console.error('Failed to update site name:', error);
    throw new Error('Failed to update site name');
  }
};

/**
 * 获取网站名称
 */
const getSiteName = async (env) => {
  try {
    const siteName = await getSetting(env, 'siteName');
    return { siteName: siteName || '' };
  } catch (error) {
    console.error('Failed to get site name:', error);
    return { siteName: '' };
  }
};

module.exports = {
  getStatus,
  getHelp,
  updateSiteName,
  getSiteName,
};
