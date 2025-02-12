// mainDashboardService.js
import { showNotification } from '../frontend/modules/websiteDashboardService.js';
import { getWebsiteGroups, getWebsites, getDockerGroups, getDockerContainers } from '../frontend/modules/api.js';
import { setRandomGroupColors, resetGroupColors } from '../frontend/modules/utils.js';
import { isRandomColorsEnabled } from '../frontend/modules/colorThemeService.js';

import { backendUrl } from '../frontend/config.js';


/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 * @returns {Promise<object|null>} - 返回包含网站和 Docker 数据的对象，如果获取失败则返回 null
 */
async function fetchMainDashboardData() {
    try {
        const startTime = performance.now();
        console.log('time8', new Date(), 'Starting fetchMainDashboardData');

        // 记录每个 API 请求的开始时间
        console.time('getWebsiteGroups');
        const websiteGroups = await getWebsiteGroups();
        console.timeEnd('getWebsiteGroups');

        console.time('getWebsites');
        const websites = await getWebsites();
        console.timeEnd('getWebsites');

        console.time('getDockerGroups');
        const dockerGroups = await getDockerGroups();
        console.timeEnd('getDockerGroups');

        console.time('getDockerContainers');
        const dockerContainers = await getDockerContainers();
        console.timeEnd('getDockerContainers');

        const fetchDataTime = performance.now() - startTime;
        console.log('time9', new Date(), `Fetch data took ${fetchDataTime} ms`);

        if (!Array.isArray(websiteGroups)) {
            console.error('Website Groups data is not an array:', websiteGroups);
        }
        if (!Array.isArray(websites)) {
            console.error('Websites data is not an array:', websites);
        }
        if (!Array.isArray(dockerGroups)) {
            console.error('Docker Groups data is not an array:', dockerGroups);
        }
        if (!Array.isArray(dockerContainers)) {
            console.error('Docker containers data is not an array:', dockerContainers);
        }

        return {
            websiteGroups: Array.isArray(websiteGroups) ? websiteGroups : [],
            websites: Array.isArray(websites) ? websites : [],
            dockerGroups: Array.isArray(dockerGroups) ? dockerGroups : [],
            dockerContainers: Array.isArray(dockerContainers) ? dockerContainers : [],
        };
    } catch (error) {
        const errorTime = performance.now() - startTime;
        console.error('Failed to fetch main dashboard data:', error);
        console.log('time10', new Date(), `Error occurred after ${errorTime} ms`);
        showNotification('数据加载失败，请重试', 'error');
        return null;
    }
}

/**
 * 渲染主仪表盘，同时渲染网站和 Docker 仪表盘
 * @param {object} data - 包含网站和 Docker 数据的对象
 */
function renderMainDashboard(data) {
    const now = new Date();
    console.log('time4', now);
    renderWebsiteDashboard(data);
    console.log('time5', now);
    renderDockerDashboard(data);
    console.log('time6', now);
}

/**
 * 渲染网站仪表盘
 * @param {object} data - 包含网站数据的对象
 */
function renderWebsiteDashboard({ websiteGroups, websites }) {
    const websitedashboard = document.getElementById('websitedashboard');
    websitedashboard.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const orderedWebsiteGroups = (websiteGroups || []).sort((a, b) => a.order - b.order);

    orderedWebsiteGroups.forEach(group => {
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
            websiteItem.innerHTML = `
                
                
                ${website.faviconUrl ? `<img src="${website.faviconUrl.startsWith('http') ? website.faviconUrl : backendUrl + website.faviconUrl}" title="${website.name}" style="margin-right: 3px;">` : ''}
                <a href="${website.url}" target="_blank">${website.name}</a>
                <span style="display:none;">${website.faviconUrl}</span>
            `;
            websiteList.appendChild(websiteItem);
        });
        fragment.appendChild(groupDiv);
    });
    websitedashboard.appendChild(fragment);
}

/**
 * 渲染 Docker 仪表盘
 * @param {object} data - 包含 Docker 数据的对象
 */
function renderDockerDashboard({ dockerGroups, dockerContainers }) {
    const dockerdashboard = document.getElementById('dockerdashboard');
    dockerdashboard.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const orderedDockerGroups = (dockerGroups || []).sort((a, b) => a.order - b.order);

    orderedDockerGroups.forEach(group => {
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
        dockerContainers?.filter(container => container.groupId === group.id).forEach(container => {
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
 * 使用数据渲染主仪表盘（包括网站和 Docker）
 */
export async function renderMainDashboardWithData() {
    const websitedashboard = document.getElementById('websitedashboard');
    const dockerdashboard = document.getElementById('dockerdashboard');
    websitedashboard.classList.add('loading');
    dockerdashboard.classList.add('loading');

    try {
        const startTime = performance.now();
        console.log('time1', new Date(), 'Starting renderMainDashboardWithData');

        const data = await fetchMainDashboardData();
        const fetchDataTime = performance.now() - startTime;
        console.log('time2', new Date(), `Fetch data took ${fetchDataTime} ms`);

        if (data) {
            const renderStartTime = performance.now();
            renderMainDashboard(data);
            const renderTime = performance.now() - renderStartTime;
            console.log('time7', new Date(), `Render main dashboard took ${renderTime} ms`);
            showNotification('数据加载成功', 'success');
        }
    } finally {
        websitedashboard.classList.remove('loading');
        dockerdashboard.classList.remove('loading');
        if (isRandomColorsEnabled()) {
            setRandomGroupColors();
        } else {
            resetGroupColors();
        }
    }
}