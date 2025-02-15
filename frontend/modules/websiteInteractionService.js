import { showNotification } from './websiteDashboardService.js';
import { renderDashboardWithData} from './mainDashboardService.js';
import { WebsiteSaveService } from './websiteDataService.js';
import { hideContextMenu } from './contextMenu.js';
import { backendUrl } from '../config.js';
import { WebsiteOperationService } from './websiteOperationService.js';
import { WebsiteTooltipService } from './websiteTooltipService.js';
import { confirmWebsiteDelete } from './websiteDeleteService.js';
import websiteImportModalHandler from './websiteImportModalHandler.js';



let currentEditWebsiteGroupId = null;
let currentEditWebsiteId = null;
const websiteOperationService = new WebsiteOperationService();
const websiteTooltipService = new WebsiteTooltipService();

// 获取图标函数
export async function fetchIcon(url) {
    try {
        const iconResponse = await fetch(`${backendUrl}/favicon?url=${url}`);
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
export async function addWebsite() {
    try {
        await websiteOperationService.openWebsiteModal({
            mode: 'add',
            callback: async ({ newWebsiteName, checknewWebsiteUrl, newWebsiteDescription, newWebsiteGroup }) => {
                const websiteSaveService = new WebsiteSaveService();
                const result = await websiteSaveService.saveWebsite(null, {
                    name: newWebsiteName,
                    url: checknewWebsiteUrl,
                    description: newWebsiteDescription
                }, newWebsiteGroup);
                if (result) {
                    renderDashboardWithData();
                }
            }
        });
    } catch (error) {
        console.error('Failed to add website:', error);
        showNotification('添加网站失败', 'error');
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
        callback: async ({ newWebsiteName, checknewWebsiteUrl, newWebsiteDescription, newWebsiteGroup }) => {
            const websiteSaveService = new WebsiteSaveService();
            
            const result = await websiteSaveService.saveWebsite(websiteId, {
                name: newWebsiteName,
                url: checknewWebsiteUrl,
                description: newWebsiteDescription,
                groupId: newWebsiteGroup,
            }, newWebsiteGroup);
            if (result) {
                renderDashboardWithData();
            }
        }
    });
}

// 删除网站
export async function deleteWebsite(groupId, websiteId) {
    try {
        const deleteOption = await confirmWebsiteDelete({
            title: '删除网站',
            message: '请选择删除选项:',
            options: [
                { id: 'permanentDelete', label: '永久删除网站' },
                { id: 'moveToTrash', label: '将网站移动到回收站' }
            ]
        });
        if (!deleteOption) return;

        const websiteSaveService = new WebsiteSaveService();
        await websiteSaveService.deleteWebsite(websiteId, deleteOption);
        renderDashboardWithData();
    } catch (error) {
        console.error('Failed to delete website:', error);
        showNotification('删除网站失败', 'error');
    }
}

// 获取网站信息
export function getWebsiteInfo(websiteId) {
    const websiteItem = document.querySelector(`.website-item[data-website-id="${websiteId}"]`);
    const websiteUrl = websiteItem.querySelector('a').getAttribute('href');
    const websiteName = websiteItem.querySelector('a').textContent;
    const websiteDescription = websiteItem.getAttribute('data-description');
    const websiteGroupId = websiteItem.getAttribute('data-group-id');
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
        showNotification('导入已取消', 'info');
      }
    );
  } catch (error) {
    console.error('Failed to open import websites modal:', error);
    showNotification('打开导入界面失败', 'error');
  }
}

// 处理网站悬停事件
export async function handleWebsiteHover(target) {
    await websiteTooltipService.handleWebsiteHover(target);
}

export function handleWebsiteClick(target) {
    if (!target) {
        return Promise.reject(new Error('Target element is required'));
    }

    const websiteId = target.dataset.websiteId;
    if (!websiteId) {
        return Promise.reject(new Error('websiteId is required'));
    }

    const websiteSaveService = new WebsiteSaveService();
    return websiteSaveService.recordWebsiteClick(websiteId)
        .catch(error => {
            console.error('Failed to record click time:', error);
            throw error;
        });
}
