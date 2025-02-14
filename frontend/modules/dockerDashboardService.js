import { showNotification } from './websiteDashboardService.js';
import {
    
    getAllDockers,
    getDockerGroups,
} from './api.js';
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
            <h2 id="dockerGroupTitle-${group.id}">
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
            // <span class="docker-status">${docker.status}</span>
            dockerItem.innerHTML = `
                
                ${docker.faviconUrl ? `<img src="${docker.faviconUrl.startsWith('http') ? docker.faviconUrl : backendUrl + docker.faviconUrl}" title="${docker.name}" style="margin-right: 3px;">` : ''}
                <a href="${docker.url}" target="_blank">${docker.name}</a>
                
            `;
            dockerList.appendChild(dockerItem);
        });
        fragment.appendChild(groupDiv);
    });
    dockerdashboard.appendChild(fragment);
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