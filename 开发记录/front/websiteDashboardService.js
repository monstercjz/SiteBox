/* === websitedashboard Main Styles - 仪表盘主样式 === */
/* 作用: 组织和导入仪表盘主样式，当前存档，功能代码已经转移到newdashboard.js */
/* 依赖： websitedashboard 子模块 */
import {
    fetchDataFromApi,
    getWebsites,
    getWebsiteGroups,
    getWebsiteById,
    getWebsiteGroupById,
    getWebsitesByGroupId,
    createWebsite,
    createWebsiteGroup,
    updateWebsite,
    updateWebsiteGroup,
    deleteWebsite,
    deleteWebsiteGroup,
    batchDeleteWebsites,
    batchMoveWebsites,
    reorderWebsiteGroups,
  } from '../../frontend/modules/api.js';
import { backendUrl } from '../../frontend/config.js';
import { setRandomGroupColors, resetGroupColors } from '../../frontend/modules/h2colorThemeService.js';
import { isRandomColorsEnabled } from '../../frontend/modules/h2colorThemeService.js';


/**
 * 显示通知消息 (仅发送消息给主线程)
 * @param {HTMLElement} notification - 通知元素
 * @param {string} message - 通知消息内容
 * @param {string} [type='info'] - 通知类型，可选值为 'info', 'success', 'error'
 */
export function showNotification(notification, message, type = 'info') {
    postMessage({ type: 'notification', notificationElement: notification, message, notificationType: type });
}

/**
 * 渲染仪表盘
 * @param {object} data - 包含网站和分组数据的对象
 * @param {Array} data.websites - 网站列表
 * @param {Array} data.groups - 分组列表
 */
function renderDashboard({ websites, groups }) {
    const websitedashboard = document.getElementById('websitedashboard');
    websitedashboard.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    const orderedGroups = (groups || []).sort((a, b) => a.order - b.order);

    orderedGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('website-group');
        groupDiv.setAttribute('draggable', true);
        groupDiv.id = `website-group-${group.id}`;
        groupDiv.innerHTML = `
            <h2 id="websiteGroupTitle-${group.id}" class="website-group__title">
                ${group?.name}
                
                
            </h2>
            <div class="website-list" id="website-list-${group.id}"></div>
        `;
        const websiteList = groupDiv.querySelector(`#website-list-${group.id}`);
        websites?.filter(website => website.groupId === group.id).forEach(website => {
            const websiteItem = document.createElement('div');
            websiteItem.classList.add('website-item');
            websiteItem.setAttribute('data-description', website.description);
            websiteItem.setAttribute('data-website-id', website.id);
            websiteItem.setAttribute('data-group-id', website.groupId);
            // style="width: 20px; height: 20px; margin-right: 3px;"移除img内联样式，改用css样式
            // ${website.faviconUrl ? `<img src="${backendUrl}${website.faviconUrl}" title="${website.name}" style="margin-right: 3px;">` : ''}
            websiteItem.innerHTML = `
                
                
                ${website.faviconUrl ? `<img src="${website.faviconUrl.startsWith('http') ? website.faviconUrl : backendUrl + website.faviconUrl}" title="${website.name}" alt="Image" loading="lazy" style="margin-right: 3px;">` : ''}
                <a href="${website.url}" target="_blank" class="website-item__link">${website.name}</a>
                <span style="display:none;">${website.faviconUrl}</span>
            `;
            websiteList.appendChild(websiteItem);
        });
        fragment.appendChild(groupDiv);
    });
    websitedashboard.appendChild(fragment);
}

/**
 * 获取仪表盘数据
 * @returns {Promise<object|null>} - 返回包含网站和分组数据的对象，如果获取失败则返回 null
 */
async function fetchDashboardData() {
    try {
        // 调用 apiService 获取网站分组数据
        const groups = await getWebsiteGroups();
        if (!Array.isArray(groups)) {
            console.error('Groups data is not an array:', groups);
            return { groups: [] , websites: []};
        }
        // 调用 apiService 获取网站数据
        const websites = await getWebsites();
         if (!Array.isArray(websites)) {
            console.error('websites data is not an array:', websites);
            return { groups, websites: [] };
        }
        return { websites, groups };
    } catch (error) {
        console.error('Failed to fetch websitedashboard data:', error);
        showNotification('数据加载失败，请重试', 'error');
        return null;
    }
}

/**
 * 渲染仪表盘数据
 */
export async function renderWebsiteDashboardWithData() {
     websitedashboard.classList.add('loading');
    try {
        const data = await fetchDashboardData();
        if (data) {
            renderDashboard(data);
            showNotification('数据加载成功', 'success');
        }
    } finally {
         websitedashboard.classList.remove('loading');
         // 根据用户偏好设置应用或重置颜色
         if (isRandomColorsEnabled()) {
             setRandomGroupColors();
         } else {
             resetGroupColors();
         }
    }
}
