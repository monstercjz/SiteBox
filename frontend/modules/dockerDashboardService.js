/* === dockerdashboard Main Styles - 仪表盘主样式 === */
/* 作用: 组织和导入仪表盘主样式，当前存档，功能代码已经转移到newdashboard.js */
/* 依赖： websitedashboard 子模块 */
import { showNotification } from './notificationService.js';
import {
    
    getAllDockers,
    getDockerGroups,
    getRealdockerinfobyId,
} from './api.js';
import { dockerUpdateInfoAll } from './dockerIfonUpdate.js';

import { backendUrl } from '../config.js';
import { setRandomGroupColors, resetGroupColors } from './utils.js';
import { isRandomColorsEnabled } from './colorThemeService.js';

/**
 * Render Docker dockerdashboard
 * @param {object} data - Data containing docker dockers and groups
 * @param {Array} data.dockers - Docker dockers list
 * @param {Array} data.groups - Docker groups list
 */
function renderDockerDashboard({ dockers, groups }) {
    const dockerdashboard = document.getElementById('dockerdashboard');
    dockerdashboard.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const orderedGroups = (groups || []).sort((a, b) => a.order - b.order);

    orderedGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('docker-group'); // Use docker-group class
        groupDiv.setAttribute('draggable', true);
        groupDiv.id = `docker-group-${group.id}`; // Use docker-group prefix for IDs
        groupDiv.innerHTML = `
            <h2 id="dockerGroupTitle-${group.id}" class="docker-group__title">
                ${group?.name}
                
                
            </h2>
            <div class="docker-list" id="docker-list-${group.id}"></div>
        `;
        const dockerList = groupDiv.querySelector(`#docker-list-${group.id}`);
        dockers?.filter(docker => docker.groupId === group.id).forEach(docker => {
            const dockerItem = document.createElement('div');
            dockerItem.classList.add('docker-item');
            dockerItem.setAttribute('data-description', docker.description);
            dockerItem.setAttribute('data-docker-id', docker.id);
            dockerItem.setAttribute('data-group-id', docker.groupId);
            dockerItem.setAttribute('data-docker-server-ip', docker.server);
            dockerItem.setAttribute('data-docker-server-port', docker.serverPort);
            dockerItem.setAttribute('data-docker-urlport', docker.urlPort); // 添加 data-docker-urlport 属性
            // <span class="docker-status">${docker.status}</span>
            dockerItem.innerHTML = `
                <div class="docker-item-header">
                    ${docker.faviconUrl ? `<img src="${docker.faviconUrl.startsWith('http') ? docker.faviconUrl : backendUrl + docker.faviconUrl}" title="${docker.name}" alt="Image" loading="lazy" style="margin-right: 3px;">` : ''}
                    <div class="docker-item-title">
                        <a href="${docker.url}:${docker.urlPort}" target="_blank" class="docker-item__link">${docker.name}</a>
                        <span class="docker-item-description">${docker.description}</span>
                    </div>
                    <span class="docker-status-indicator"></span>
                </div>
                <div class="docker-item-body">
                    <div class="docker-item-stats">
                        <div class="docker-item-cpu">
                            <span class="docker-item-stats-value">0%</span>
                            <span class="docker-item-stats-label">处理器</span>
                        </div>
                        <div class="docker-item-networkIo-receive">
                            <span class="docker-item-stats-value">0 GB</span>
                            <span class="docker-item-stats-label">接收</span>
                        </div>
                        <div class="docker-item-networkIo-send">
                            <span class="docker-item-stats-value">0 MB</span>
                            <span class="docker-item-stats-label">发送</span>
                        </div>
                    </div>
                </div>
            `;
            dockerList.appendChild(dockerItem);
        });
        fragment.appendChild(groupDiv);
    });
    dockerdashboard.appendChild(fragment);
    dockerUpdateInfoAll(); // Call dockerUpdateInfoAll to update real-time info

}

/**
 * Fetch dockerdashboard data for Docker
 * @returns {Promise<object|null>} - Data object with docker dockers and groups, or null on failure
 */
async function fetchDockerDashboardData() {
    try {
        const [groups, dockers] = await Promise.all([
            getDockerGroups(),
            getAllDockers()
        ]);
        if (!Array.isArray(groups)) {
            console.error('Docker Groups data is not an array:', groups);
            return { groups: [], dockers: [] };
        }
        
        if (!Array.isArray(dockers)) {
            console.error('Docker dockers data is not an array:', dockers);
            return { groups, dockers: [] };
        }
        return { dockers, groups };
    } catch (error) {
        console.error('Failed to fetch dockerdashboard data:', error);
        showNotification('Docker 数据加载失败，请重试', 'error');
        return null;
    }
}

/**
 * Render Docker dockerdashboard with data
 */
export async function renderDockerDashboardWithData() {
    const dockerdashboard = document.getElementById('dockerdashboard');
    dockerdashboard.classList.add('loading');
    try {
        const data = await fetchDockerDashboardData();
        if (data) {
            renderDockerDashboard(data);
            showNotification('Docker 数据加载成功', 'success');
        }
    } finally {
        dockerdashboard.classList.remove('loading');
        if (isRandomColorsEnabled()) {
            // setRandomGroupColors(); // Consider if group colors are relevant for docker
        } else {
            // resetGroupColors(); // Consider if group colors are relevant for docker
        }
    }
}