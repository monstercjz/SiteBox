import { showNotification } from './websiteDashboardService.js';
import {
    fetchDataFromApi,
    getDockerContainers,
    getDockerGroups,
    getDockerContainerById,
    getDockerGroupById,
    getDockerGroupById as getDockerGroupsByGroupId, // 注意这里可能需要根据实际情况调整
    createDockerGroup,
    updateDockerGroup,
    deleteDockerGroup,
    reorderDockerGroups,
} from './api.js';
import { backendUrl } from '../config.js';
import { setRandomGroupColors, resetGroupColors } from './utils.js';
import { isRandomColorsEnabled } from './colorThemeService.js';

/**
 * Render Docker dockerdashboard
 * @param {object} data - Data containing docker containers and groups
 * @param {Array} data.containers - Docker containers list
 * @param {Array} data.groups - Docker groups list
 */
function renderDockerDashboard({ containers, groups }) {
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
            <h2>
                ${group?.name}
                <input type="text" id="editDockerGroupName-${group.id}" style="display:none;" placeholder="New Group Name">
                <button onclick="saveDockerGroup(${group.id})" style="display:none;">Save</button>
            </h2>
            <div class="docker-list" id="docker-list-${group.id}"></div>
        `;
        const dockerList = groupDiv.querySelector(`#docker-list-${group.id}`);
        containers?.filter(container => container.groupId === group.id).forEach(container => {
            const dockerItem = document.createElement('div');
            dockerItem.classList.add('docker-item');
            dockerItem.setAttribute('data-description', container.description);
            dockerItem.setAttribute('data-docker-id', container.id);
            dockerItem.setAttribute('data-group-id', container.groupId);
            dockerItem.innerHTML = `
                <i class="icon docker-icon"></i> 
                <span class="docker-name">${container.name}</span> 
                <span class="docker-status">${container.status}</span>  
            `;
            dockerList.appendChild(dockerItem);
        });
        fragment.appendChild(groupDiv);
    });
    dockerdashboard.appendChild(fragment);
}

/**
 * Fetch dockerdashboard data for Docker
 * @returns {Promise<object|null>} - Data object with docker containers and groups, or null on failure
 */
async function fetchDockerDashboardData() {
    try {
        const [groups, containers] = await Promise.all([
            getDockerGroups(),
            getDockerContainers()
        ]);
        if (!Array.isArray(groups)) {
            console.error('Docker Groups data is not an array:', groups);
            return { groups: [], containers: [] };
        }
        
        if (!Array.isArray(containers)) {
            console.error('Docker containers data is not an array:', containers);
            return { groups, containers: [] };
        }
        return { containers, groups };
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