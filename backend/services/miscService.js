// backend/services/miscService.js
/**
 * @description 获取系统状态
 */
const getStatus = async () => {
    return { status: 'ok' };
};

/**
 * @description 获取帮助文档
 */
const getHelp = async () => {
    return {
        message: 'This is the help documentation for the API.',
        endpoints: [
            { method: 'GET', path: '/groups', description: 'Get all groups' },
            { method: 'POST', path: '/groups', description: 'Create a new group' },
            { method: 'GET', path: '/groups/:groupId', description: 'Get a group by ID' },
            { method: 'PUT', path: '/groups/:groupId', description: 'Update a group' },
            { method: 'DELETE', path: '/groups/:groupId', description: 'Delete a group' },
            { method: 'PATCH', path: '/groups/reorder', description: 'Reorder groups' },
            { method: 'GET', path: '/websites', description: 'Get all websites' },
            { method: 'GET', path: '/websites/groups/:groupId/websites', description: 'Get all websites in a group' },
            { method: 'POST', path: '/websites/groups/:groupId/websites', description: 'Create a new website in a group' },
            { method: 'GET', path: '/websites/:websiteId', description: 'Get a website by ID' },
            { method: 'PUT', path: '/websites/:websiteId', description: 'Update a website' },
            { method: 'DELETE', path: '/websites/:websiteId', description: 'Delete a website' },
            { method: 'PATCH', path: '/websites/reorder', description: 'Reorder websites' },
            { method: 'DELETE', path: '/websites/batch', description: 'Batch delete websites' },
            { method: 'PATCH', path: '/websites/batch-move', description: 'Batch move websites to another group' },
            { method: 'GET', path: '/search?keyword=xxx', description: 'Search groups and websites' },
            { method: 'GET', path: '/sync/export', description: 'Export all data' },
            { method: 'POST', path: '/sync/import', description: 'Import data' },
            { method: 'POST', path: '/sync/history/restore', description: 'Restore data to a specific version' },
            { method: 'GET', path: '/settings', description: 'Get user settings' },
            { method: 'PUT', path: '/settings', description: 'Update user settings' },
            { method: 'POST', path: '/settings/icon', description: 'Upload a custom icon' },
            { method: 'GET', path: '/analytics', description: 'Get website access analytics' },
            { method: 'GET', path: '/extension/data', description: 'Get browser extension data' },
            { method: 'POST', path: '/extension/sync', description: 'Sync browser bookmarks' },
            { method: 'GET', path: '/status', description: 'Get server status' },
            { method: 'GET', path: '/help', description: 'Get API documentation' },
            { method: 'POST', path: '/sync/moveToTrash', description: 'Move website to trash' },
        ]
    };
};

module.exports = {
    getStatus,
    getHelp,
};