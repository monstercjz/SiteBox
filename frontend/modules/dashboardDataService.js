import {
    fetchDataFromApi,
    getWebsites,
    getGroups,
    getWebsiteById,
    getGroupById,
    getWebsitesByGroupId,
    createWebsite,
    createGroup,
    updateWebsite,
    updateGroup,
    deleteWebsite,
    deleteGroup,
    batchDeleteWebsites,
    batchMoveWebsites,
    reorderGroups,
  } from './api.js';
import { backendUrl } from '../config.js';
import { setRandomGroupColors, resetGroupColors } from './utils.js';
import { isRandomColorsEnabled } from './colorThemeService.js';
const notification = document.createElement('div');

/**
 * 显示通知消息
 * @param {string} message - 通知消息内容
 * @param {string} [type='info'] - 通知类型，可选值为 'info', 'success', 'error'
 */
export function showNotification(message, type = 'info') {
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.transform = 'translateX(0)';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.transform = 'translateY(-20px)';
    notification.style.opacity = '0';
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * 渲染仪表盘
 * @param {object} data - 包含网站和分组数据的对象
 * @param {Array} data.websites - 网站列表
 * @param {Array} data.groups - 分组列表
 */
function renderDashboard({ websites, groups }) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    const orderedGroups = (groups || []).sort((a, b) => a.order - b.order);

    orderedGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.setAttribute('draggable', true);
        groupDiv.id = `group-${group.id}`;
        groupDiv.innerHTML = `
            <h2>
                ${group?.name}
                <input type="text" id="editGroupName-${group.id}" style="display:none;" placeholder="New Group Name">
                <button onclick="saveGroup(${group.id})" style="display:none;">保存</button>
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
                
                
                ${website.faviconUrl ? `<img src="${website.faviconUrl.startsWith('http') ? website.faviconUrl : backendUrl + website.faviconUrl}" title="${website.name}" style="margin-right: 3px;">` : ''}
                <a href="${website.url}" target="_blank">${website.name}</a>
                <span style="display:none;">${website.faviconUrl}</span>
            `;
            websiteList.appendChild(websiteItem);
        });
        fragment.appendChild(groupDiv);
    });
    dashboard.appendChild(fragment);
}

/**
 * 获取仪表盘数据
 * @returns {Promise<object|null>} - 返回包含网站和分组数据的对象，如果获取失败则返回 null
 */
async function fetchDashboardData() {
    try {
        // 调用 apiService 获取分组数据
        const groups = await getGroups();
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
        console.error('Failed to fetch dashboard data:', error);
        showNotification('数据加载失败，请重试', 'error');
        return null;
    }
}

/**
 * 渲染仪表盘数据
 */
export async function renderDashboardWithData() {
     dashboard.classList.add('loading');
    try {
        const data = await fetchDashboardData();
        if (data) {
            renderDashboard(data);
            showNotification('数据加载成功', 'success');
        }
    } finally {
         dashboard.classList.remove('loading');
         // 根据用户偏好设置应用或重置颜色
         if (isRandomColorsEnabled()) {
             setRandomGroupColors();
         } else {
             resetGroupColors();
         }
    }
}
