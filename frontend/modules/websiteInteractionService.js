import { showNotification } from './utils.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { WebsiteSaveService } from './websiteDataService.js';
import { hideContextMenu } from './contextMenu.js';
import { backendUrl } from '../config.js';
import { WebsiteOperationService } from './websiteOperationService.js';

import { confirmWebsiteDelete } from './websiteDeleteService.js';
import websiteImportModalHandler from './websiteImportModalHandler.js';
import {
    NOTIFICATION_ADD_WEBSITE_FAIL,
    NOTIFICATION_DELETE_WEBSITE_FAIL,
    NOTIFICATION_OPEN_IMPORT_MODAL_FAIL,
    NOTIFICATION_IMPORT_CANCELLED,
    MODAL_TITLE_DELETE_WEBSITE,
    MODAL_OPTION_PERMANENT_DELETE,
    MODAL_OPTION_MOVE_TO_TRASH,
    DATA_DESCRIPTION,
    DATA_GROUP_ID,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    API_PATH_FETCH_ICON,
    SELECTOR_WEBSITE_ITEM_TEMPLATE,
    ERROR_TARGET_ELEMENT_REQUIRED,
    ERROR_WEBSITE_ID_REQUIRED,
} from '../config.js';
import { domaddWebsiteItem, domremoveWebsiteItem } from './mainDashboardServiceOrderFirst.js';

let currentEditWebsiteGroupId = null;
let currentEditWebsiteId = null;
const websiteOperationService = new WebsiteOperationService();


// 获取图标函数
export async function fetchIcon(url) {
    try {
        const iconResponse = await fetch(`${backendUrl}${API_PATH_FETCH_ICON}${url}`);
        if (iconResponse.ok) {
            return await iconResponse.json();
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch icon:', error);
        return null;
    }
}

// 添加网站
export async function addWebsite(groupId) {
    try {
        await websiteOperationService.openWebsiteModal({
            mode: 'add',
            groupId: groupId,
            callback: async ({ newWebsiteName, checkNewWebsiteUrl, newWebsiteDescription, newWebsiteGroup }) => {
                const websiteSaveService = new WebsiteSaveService();
                const result = await websiteSaveService.saveWebsite(null, {
                    name: newWebsiteName,
                    url: checkNewWebsiteUrl,
                    description: newWebsiteDescription,
                }, newWebsiteGroup);
                if (result) {
                    // renderDashboardWithData();
                    //更新ui
                    domaddWebsiteItem(result);
                }
            },
        });
    } catch (error) {
        console.error('Failed to add website:', error);
        showNotification(NOTIFICATION_ADD_WEBSITE_FAIL, 'error');
    }
}

// 编辑网站
export async function editWebsite(groupId, websiteId) {
    hideContextMenu();
    currentEditWebsiteGroupId = groupId;
    currentEditWebsiteId = websiteId;
    websiteOperationService.openWebsiteModal({
        mode: 'edit',
        websiteId: websiteId,
        groupId: groupId,
        callback: async ({ newWebsiteName, checkNewWebsiteUrl, newWebsiteDescription, newWebsiteGroup }) => {
            const websiteSaveService = new WebsiteSaveService();
            const result = await websiteSaveService.saveWebsite(websiteId, {
                name: newWebsiteName,
                url: checkNewWebsiteUrl,
                description: newWebsiteDescription,
                groupId: newWebsiteGroup,
            }, newWebsiteGroup);
            if (result) {
                renderDashboardWithData();
            }
        },
    });
}

// 删除网站
export async function deleteWebsite(groupId, websiteId) {
    try {
        const deleteOption = await confirmWebsiteDelete({
            title: MODAL_TITLE_DELETE_WEBSITE,
            message: '请选择删除选项:',
            options: [
                { id: OPTION_ID_PERMANENT_DELETE, label: MODAL_OPTION_PERMANENT_DELETE },
                { id: OPTION_ID_MOVE_TO_TRASH, label: MODAL_OPTION_MOVE_TO_TRASH },
            ],
        });
        if (!deleteOption) return;
        const websiteSaveService = new WebsiteSaveService();
        await websiteSaveService.deleteWebsite(websiteId, deleteOption);
        //更新ui
        domremoveWebsiteItem(websiteId);
        // renderDashboardWithData();
    } catch (error) {
        console.error('Failed to delete website:', error);
        showNotification(NOTIFICATION_DELETE_WEBSITE_FAIL, 'error');
    }
}

// 获取网站信息
export function getWebsiteInfo(websiteId) {
    const websiteItem = document.querySelector(SELECTOR_WEBSITE_ITEM_TEMPLATE(websiteId));
    const websiteUrl = websiteItem.querySelector('a').getAttribute('href');
    const websiteName = websiteItem.querySelector('a').textContent;
    const websiteDescription = websiteItem.getAttribute(DATA_DESCRIPTION);
    const websiteGroupId = websiteItem.getAttribute(DATA_GROUP_ID);
    return { websiteName, websiteUrl, websiteDescription, websiteGroupId };
}

export async function openImportWebsitesModal() {
    try {
        await websiteImportModalHandler.showImportModal(
            async (websites, groupId) => {
                const websiteSaveService = new WebsiteSaveService();
                const result = await websiteSaveService.importWebsites(websites, groupId);

                if (result.success) {
                    showNotification(`成功导入${result.count}个网站`, 'success');
                    renderDashboardWithData();
                } else {
                    showNotification(result.message || '网站导入失败', 'error');
                }
            },
            () => {
                showNotification(NOTIFICATION_IMPORT_CANCELLED, 'info');
            }
        );
    } catch (error) {
        console.error('Failed to open import websites modal:', error);
        showNotification(NOTIFICATION_OPEN_IMPORT_MODAL_FAIL, 'error');
    }
}



export function handleWebsiteClick(target) {
    if (!target) {
        return Promise.reject(new Error(ERROR_TARGET_ELEMENT_REQUIRED));
    }
    const websiteId = target.dataset.itemId;
    if (!websiteId) {
        return Promise.reject(new Error(ERROR_WEBSITE_ID_REQUIRED));
    }
    const websiteSaveService = new WebsiteSaveService();
    return websiteSaveService.recordWebsiteClick(websiteId)
        .catch(error => {
            console.error('Failed to record click time:', error);
            throw error;
        });
}