const { readData, writeData } = require('../utils/fileHandler');
const { USER_DATA_FILE_PATH } = require('../config/constants');


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

/**
 * @description 更新网站名称
 * @param {string} newSiteName - 新的网站名称
 */
const updateSiteName = async (newSiteName) => {
    const filePath = USER_DATA_FILE_PATH;

    try {
        // 尝试读取数据，如果文件不存在会自动创建并返回默认数据
        let userData = await readData(filePath);
        if (!userData || typeof userData !== 'object') { // 确保userData是对象
            userData = {};
        }

        // 更新网站名称
        userData.siteName = newSiteName;

        // 将更新后的内容写回文件
        await writeData(filePath, userData);

        console.log('Updated site name:', newSiteName);
        return { message: 'Site name updated successfully', newSiteName };
    } catch (error) {
        console.error('Failed to update site name:', error);
        throw new Error('Failed to update site name');
    }
};
/**
 * @description 获取网站名称
 */
const getSiteName = async () => {
    const filePath = USER_DATA_FILE_PATH;

    try {
        // 尝试读取数据
        const userData = await readData(filePath);
        if (!userData || typeof userData !== 'object' || !userData.siteName) {
            return { siteName: '' }; // 如果文件不存在或siteName不存在，返回空字符串
        }

        // 返回网站名称
        return { siteName: userData.siteName };
    } catch (error) {
        console.error('Failed to get site name:', error);
        return { siteName: '' }; // 发生错误时返回空字符串
    }
};
module.exports = {
    getStatus,
    getHelp,
    updateSiteName,
    getSiteName,
};


