import { createWebsite, updateWebsite, deleteWebsite, batchMoveWebsites, moveToTrash, recordWebsiteClick } from './api.js';
import { showNotification } from './utils.js';
import { validateAndCompleteUrl } from './utils.js';
import {
    NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL,
    NOTIFICATION_WEBSITE_UPDATE_SUCCESS,
    NOTIFICATION_WEBSITE_CREATE_SUCCESS,
    NOTIFICATION_SAVE_WEBSITE_FAIL,
    NOTIFICATION_WEBSITE_DELETE_SUCCESS,
    NOTIFICATION_WEBSITE_MOVED_TO_TRASH,
    NOTIFICATION_DELETE_WEBSITE_FAIL,
    NOTIFICATION_WEBSITE_MOVE_SUCCESS,
    NOTIFICATION_MOVE_WEBSITE_FAIL,
    NOTIFICATION_NO_VALID_WEBSITES,
    NOTIFICATION_NO_VALID_URLS,
    DEFAULT_GROUP_NAME,
    DATA_NAME,
    DATA_URL,
    DATA_DESCRIPTION,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    API_METHOD_CREATE_WEBSITE_GROUP,
    API_METHOD_GET_WEBSITE_GROUPS,
    API_METHOD_BATCH_IMPORT_WEBSITES,
    ERROR_FETCH_OR_CREATE_DEFAULT_GROUP,
    GROUP_TYPE_WEBSITE,
    DASHBOARD_TYPE_WEBSITE
} from '../config.js';

export class WebsiteSaveService {
    async saveWebsite(websiteId, websiteData, groupId) {
        try {
            

            let actualGroupId = groupId;
            if (!actualGroupId) {
                const { getWebsiteGroups, createWebsiteGroup } = await import('./api.js');
                try {
                    const groups = await getWebsiteGroups();
                    

                    let defaultGroup;
                    if (groups) {
                        defaultGroup = groups.find(group => group.name === DEFAULT_GROUP_NAME);
                        
                    }

                    if (!defaultGroup) {
                        const groupName = new Date().toLocaleString();
                        const newGroup = await createWebsiteGroup({ name: groupName, isCollapsible: false,groupType: 'website-group' ,dashboardType: 'docker'  });
                        actualGroupId = newGroup.id;
                    } else {
                        actualGroupId = defaultGroup.id;
                    }
                } catch (error) {
                    console.error(ERROR_FETCH_OR_CREATE_DEFAULT_GROUP, error);
                    showNotification(NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL, 'error');
                    throw error;
                }
            }

            if (websiteId) {
                // 更新网站
                const updatedWebsite = await updateWebsite(websiteId, websiteData);
                showNotification(NOTIFICATION_WEBSITE_UPDATE_SUCCESS, 'success');
                return updatedWebsite;
            } else {
                // 创建网站
                const newWebsite = await createWebsite(actualGroupId, websiteData);
                showNotification(NOTIFICATION_WEBSITE_CREATE_SUCCESS, 'success');
                return newWebsite;
            }
        } catch (error) {
            console.error('Failed to save website:', error);
            showNotification(NOTIFICATION_SAVE_WEBSITE_FAIL, 'error');
            throw error;
        }
    }

    async deleteWebsite(websiteId, deleteOption) {
        try {
            if (deleteOption === OPTION_ID_PERMANENT_DELETE) {
                const response = await deleteWebsite(websiteId);
                showNotification(NOTIFICATION_WEBSITE_DELETE_SUCCESS, 'success');
                return response;
            } else if (deleteOption === OPTION_ID_MOVE_TO_TRASH) {
                const response = await moveToTrash(websiteId);
                showNotification(NOTIFICATION_WEBSITE_MOVED_TO_TRASH, 'success');
                return response;
            }
        } catch (error) {
            console.error('Failed to delete website:', error);
            showNotification(NOTIFICATION_DELETE_WEBSITE_FAIL, 'error');
            throw error;
        }
    }

    async moveWebsites(websiteIds, groupId) {
        try {
            const response = await batchMoveWebsites(websiteIds, groupId);
            showNotification(NOTIFICATION_WEBSITE_MOVE_SUCCESS, 'success');
            return response;
        } catch (error) {
            console.error('Failed to move websites:', error);
            showNotification(NOTIFICATION_MOVE_WEBSITE_FAIL, 'error');
            throw error;
        }
    }

    /**
     * 记录网站点击时间
     * @param {string} websiteId - 网站ID
     * @returns {Promise} - 返回API调用结果
     */
    async recordWebsiteClick(websiteId) {
        try {
            const response = await recordWebsiteClick(websiteId);
            return response;
        } catch (error) {
            console.error('Failed to record website click:', error);
            throw error;
        }
    }

    /**
     * 解析导入的网站数据
     * @param {string} rawData - 原始数据
     * @returns {Array} 解析后的网站对象数组
     */
    parseImportedWebsites(rawData) {
        return rawData.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const parts = line.split('+').map(item => item.trim());
                return {
                    [DATA_NAME]: parts[0] || '',
                    [DATA_URL]: parts[1] || '',
                    description: parts[2] || ''//此处未设置常量
                };
            });
    }

    /**
     * 验证网站数据
     * @param {Array} websites - 网站数据数组
     * @returns {boolean} 是否包含有效数据
     */
    validateImportedWebsites(websites) {
        return websites.length > 0;
    }

    /**
     * 导入网站
     * @param {string} rawData - 原始数据
     * @param {string} groupId - 分组ID
     * @returns {Object} 导入结果
     */
    async importWebsites(rawData, groupId) {
        try {
            const websites = this.parseImportedWebsites(rawData);

            if (!this.validateImportedWebsites(websites)) {
                return {
                    success: false,
                    message: NOTIFICATION_NO_VALID_WEBSITES,
                };
            }

            // 验证并补全 URL
            const validatedWebsites = websites.map(website => {
                const validatedUrl = validateAndCompleteUrl(website[DATA_URL]);
                return validatedUrl ? {
                    [DATA_NAME]: website[DATA_NAME],
                    [DATA_URL]: validatedUrl,
                    description: website.description,//此处未设置常量
                } : null;
            }).filter(Boolean);

            if (validatedWebsites.length === 0) {
                return {
                    success: false,
                    message: NOTIFICATION_NO_VALID_URLS,
                };
            }

            let actualGroupId = groupId;
            if (!actualGroupId) {
                const { getWebsiteGroups, createWebsiteGroup } = await import('./api.js');
                const groups = await getWebsiteGroups();
                const groupName = new Date().toLocaleString();
                const newGroup = await createWebsiteGroup({ name: groupName, isCollapsible: false,groupType: GROUP_TYPE_WEBSITE,dashboardType:DASHBOARD_TYPE_WEBSITE });
                actualGroupId = newGroup.id;
            }

            const { batchImportWebsites } = await import('./api.js');
            const result = await batchImportWebsites(validatedWebsites, actualGroupId);

            return {
                success: result.success,
                count: result.count,
                message: result.success ? null : '导入网站失败',
            };
        } catch (error) {
            console.error('Failed to import websites:', error);
            throw error;
        }
    }
}