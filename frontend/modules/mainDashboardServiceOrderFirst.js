/* ===  仪表盘主样式 === */
/* 作用: 组织和导入仪表盘主样式，以group全局order顺序为第一优先级，进行渲染 */
/* 依赖： websitedashboard 子模块 */
/**全局排序 ：
在 renderMainDashboard 方法中，合并了 websiteGroups 和 dockerGroups，并通过 sort((a, b) => a.order - b.order) 对所有分组进行全局排序。
这样可以确保无论分组属于哪个仪表盘，它们都能按照全局顺序正确显示。
分离文档片段 ：
使用两个文档片段（fragmentWebsite 和 fragmentDocker）分别存储 websitedashboard 和 dockerdashboard 的内容。
最后再将文档片段一次性插入到对应的仪表盘中，减少直接操作 DOM 的次数。
灵活性 ：
通过 group.dashboardType 决定分组显示在哪个仪表盘。
通过 group.groupType 决定分组的显示结构。
性能优化 ：
使用 DocumentFragment 减少直接操作 DOM 的次数，提升渲染性能。
*/

import { showNotification } from './websiteDashboardService.js';
import { getWebsiteGroups, getWebsites, getAllDockers, getDockerGroups } from './api.js';
import { setRandomGroupColors, resetGroupColors } from './utils.js';
import { isRandomColorsEnabled } from './colorThemeService.js';
import { backendUrl } from '../config.js';

/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 * @returns {Promise<object|null>} - 返回包含网站和 Docker 数据的对象，如果获取失败则返回 null
 */
async function fetchMainDashboardData() {
    try {
        const websiteGroups = await getWebsiteGroups();
        const websites = await getWebsites();
        const dockerGroups = await getDockerGroups();
        const dockers = await getAllDockers();

        // 验证数据是否为数组
        if (!Array.isArray(websiteGroups)) {
            console.error('Website Groups data is not an array:', websiteGroups);
        }
        if (!Array.isArray(websites)) {
            console.error('Websites data is not an array:', websites);
        }
        if (!Array.isArray(dockerGroups)) {
            console.error('Docker Groups data is not an array:', dockerGroups);
        }
        if (!Array.isArray(dockers)) {
            console.error('Docker containers data is not an array:', dockers);
        }

        return {
            websiteGroups: Array.isArray(websiteGroups) ? websiteGroups : [],
            websites: Array.isArray(websites) ? websites : [],
            dockerGroups: Array.isArray(dockerGroups) ? dockerGroups : [],
            dockers: Array.isArray(dockers) ? dockers : [],
        };
    } catch (error) {
        console.error('Failed to fetch main dashboard data:', error);
        showNotification('数据加载失败，请重试', 'error');
        return null;
    }
}

/**
 * 渲染主仪表盘，同时渲染网站和 Docker 仪表盘
 * @param {object} data - 包含网站和 Docker 数据的对象
 */
function renderMainDashboard(data) {
    const websitedashboard = document.getElementById('websitedashboard');
    const dockerdashboard = document.getElementById('dockerdashboard');
    const main = document.querySelector('main');

    // 清空现有内容
    websitedashboard.innerHTML = '';
    dockerdashboard.innerHTML = '';
    main.innerHTML = '';

    // 合并所有分组，并按全局顺序排序
    const allGroups = [...data.websiteGroups, ...data.dockerGroups].sort((a, b) => a.order - b.order);

    // 创建文档片段以优化 DOM 操作
    const fragmentWebsite = document.createDocumentFragment();
    const fragmentDocker = document.createDocumentFragment();

    // 根据 group.dashboardType 和 group.groupType 渲染分组
    allGroups.forEach(group => {
        const groupFragment = renderGroup(group, data.websites, data.dockers);

        // 根据 dashboardType 决定将分组添加到哪个仪表盘
        if (group.dashboardType === 'website') {
            fragmentWebsite.appendChild(groupFragment);
        } else if (group.dashboardType === 'docker') {
            fragmentDocker.appendChild(groupFragment);
        }
    });

    // 将分组添加到对应的仪表盘
    websitedashboard.appendChild(fragmentWebsite);
    dockerdashboard.appendChild(fragmentDocker);

    // 将两个仪表盘添加到主体中
    main.appendChild(websitedashboard);
    main.appendChild(dockerdashboard);
}

/**
 * 渲染单个分组
 * @param {object} group - 分组对象
 * @param {Array} websites - 网站列表
 * @param {Array} dockers - Docker 容器列表
 * @returns {HTMLDivElement} - 包含分组内容的 DOM 元素
 */
function renderGroup(group, websites, dockers) {
    // 根据 groupType 决定分组的显示结构
    if (group.groupType === 'website-group') {
        return renderWebsiteGroup(group, websites);
    } else if (group.groupType === 'docker-group') {
        return renderDockerGroup(group, dockers);
    }
    return null;
}

/**
 * 渲染网站分组
 * @param {object} group - 网站分组对象
 * @param {Array} websites - 网站列表
 * @returns {HTMLDivElement} - 网站分组的 DOM 元素
 */
function renderWebsiteGroup(group, websites) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('website-group');
    groupDiv.setAttribute('draggable', true);
    groupDiv.id = `website-group-${group.id}`;
    groupDiv.setAttribute('groupType', group.groupType);

    groupDiv.innerHTML = `
        <h2 id="websiteGroupTitle-${group.id}" class="website-group__title">
            ${group?.name}
        </h2>
        <div class="website-list" id="website-list-${group.id}"></div>
    `;

    const websiteList = groupDiv.querySelector(`#website-list-${group.id}`);
    websites
        ?.filter(website => website.groupId === group.id)
        .forEach(website => {
            const websiteItem = document.createElement('div');
            websiteItem.classList.add('website-item');
            websiteItem.setAttribute('data-description', website.description);
            websiteItem.setAttribute('data-website-id', website.id);
            websiteItem.setAttribute('data-group-id', website.groupId);

            websiteItem.innerHTML = `
                ${website.faviconUrl ? `<img src="${website.faviconUrl.startsWith('http') ? website.faviconUrl : backendUrl + website.faviconUrl}" title="${website.name}" alt="Image" loading="lazy">` : ''}
                <a href="${website.url}" target="_blank" class="website-item__link">${website.name}</a>
            `;

            websiteList.appendChild(websiteItem);
        });

    return groupDiv;
}

/**
 * 渲染 Docker 分组
 * @param {object} group - Docker 分组对象
 * @param {Array} dockers - Docker 容器列表
 * @returns {HTMLDivElement} - Docker 分组的 DOM 元素
 */
function renderDockerGroup(group, dockers) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('docker-group');
    groupDiv.setAttribute('draggable', true);
    groupDiv.id = `docker-group-${group.id}`;
    groupDiv.setAttribute('groupType', group.groupType);

    groupDiv.innerHTML = `
        <h2 id="dockerGroupTitle-${group.id}" class="docker-group__title">
            ${group?.name}
        </h2>
        <div class="docker-list" id="docker-list-${group.id}"></div>
    `;

    const dockerList = groupDiv.querySelector(`#docker-list-${group.id}`);
    dockers
        ?.filter(docker => docker.groupId === group.id)
        .forEach(docker => {
            const dockerItem = document.createElement('div');
            dockerItem.classList.add('docker-item');
            dockerItem.setAttribute('data-description', docker.description);
            dockerItem.setAttribute('data-docker-id', docker.id);
            dockerItem.setAttribute('data-group-id', docker.groupId);
            dockerItem.setAttribute('data-docker-server-ip', docker.server);
            dockerItem.setAttribute('data-docker-server-port', docker.serverPort);
            dockerItem.setAttribute('data-docker-urlport', docker.urlPort);

            dockerItem.innerHTML = `
                <div class="docker-item-header">
                    <div class="docker-item-title">
                        ${docker.faviconUrl ? `<img src="${docker.faviconUrl.startsWith('http') ? docker.faviconUrl : backendUrl + docker.faviconUrl}" title="${docker.name}" alt="Image" loading="lazy">` : ''}
                        <a href="${docker.url}:${docker.urlPort}" target="_blank" class="docker-item__link">${docker.name}</a>
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

    return groupDiv;
}

/**
 * 使用数据渲染主仪表盘（包括网站和 Docker）
 */
export async function renderMainDashboardWithData() {
    const websitedashboard = document.getElementById('websitedashboard');
    websitedashboard.classList.add('loading');

    try {
        const data = await fetchMainDashboardData();
        if (data) {
            renderMainDashboard(data);
            showNotification('数据加载成功', 'success');
        }
    } finally {
        websitedashboard.classList.remove('loading');

        if (isRandomColorsEnabled()) {
            setRandomGroupColors();
        } else {
            resetGroupColors();
        }
    }
}