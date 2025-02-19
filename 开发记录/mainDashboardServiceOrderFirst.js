import { showNotification } from './websiteDashboardService.js';
import { getWebsiteGroups, getWebsites, getAllDockers, getDockerGroups } from './api.js';
import { setRandomGroupColors, resetGroupColors } from './utils.js';
import { isRandomColorsEnabled } from './colorThemeService.js';
import { backendUrl } from '../config.js';
import {
    WEBSITE_DASHBOARD_ID,
    DOCKER_DASHBOARD_ID,
    MAIN_CONTAINER_SELECTOR,
    DASHBOARD_TYPE_WEBSITE,
    DASHBOARD_TYPE_DOCKER,
    GROUP_TYPE_WEBSITE,
    GROUP_TYPE_DOCKER,
    CLASS_WEBSITE_GROUP,
    CLASS_DOCKER_GROUP,
    CLASS_WEBSITE_ITEM,
    CLASS_DOCKER_ITEM,
    DATA_DESCRIPTION,
    DATA_ITEM_ID,
    DATA_GROUP_ID,
    DATA_DOCKER_SERVER_IP,
    DATA_DOCKER_SERVER_PORT,
    DATA_DOCKER_URLPORT,
    LOADING_CLASS,
    NOTIFICATION_SUCCESS,
    NOTIFICATION_ERROR,
} from '../config.js';

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
        showNotification('数据加载失败，请重试', NOTIFICATION_ERROR);
        return null;
    }
}

/**
 * 渲染主仪表盘，同时渲染网站和 Docker 仪表盘
 * @param {object} data - 包含网站和 Docker 数据的对象
 */
function renderMainDashboard(data) {
    // 定义常量，避免重复查找 DOM 元素
    const WEBSITE_DASHBOARD = document.getElementById(WEBSITE_DASHBOARD_ID);
    const DOCKER_DASHBOARD = document.getElementById(DOCKER_DASHBOARD_ID);
    const MAIN_CONTAINER = document.querySelector(MAIN_CONTAINER_SELECTOR);

    // 清空现有内容
    clearDashboard([WEBSITE_DASHBOARD, DOCKER_DASHBOARD, MAIN_CONTAINER]);

    // 合并所有分组，并按全局顺序排序
    const allGroups = [...data.websiteGroups, ...data.dockerGroups].sort((a, b) => a.order - b.order);

    // 创建文档片段以优化 DOM 操作
    const fragmentWebsite = document.createDocumentFragment();
    const fragmentDocker = document.createDocumentFragment();

    // 根据 group.dashboardType 和 group.groupType 渲染分组
    allGroups.forEach(group => {
        const groupFragment = renderGroup(group, data.websites, data.dockers);

        // 根据 dashboardType 决定将分组添加到哪个仪表盘
        if (group.dashboardType === DASHBOARD_TYPE_WEBSITE) {
            fragmentWebsite.appendChild(groupFragment);
        } else if (group.dashboardType === DASHBOARD_TYPE_DOCKER) {
            fragmentDocker.appendChild(groupFragment);
        }
    });

    // 将文档片段附加到仪表盘
    appendFragmentsToDashboards({
        [DASHBOARD_TYPE_WEBSITE]: { dashboard: WEBSITE_DASHBOARD, fragment: fragmentWebsite },
        [DASHBOARD_TYPE_DOCKER]: { dashboard: DOCKER_DASHBOARD, fragment: fragmentDocker },
    });

    // 将两个仪表盘添加到主体中
    MAIN_CONTAINER.appendChild(WEBSITE_DASHBOARD);
    MAIN_CONTAINER.appendChild(DOCKER_DASHBOARD);
}

/**
 * 清空仪表盘内容
 * @param {HTMLElement[]} dashboards - 要清空的仪表盘元素数组
 */
function clearDashboard(dashboards) {
    dashboards.forEach(dashboard => (dashboard.innerHTML = ''));
}

/**
 * 将文档片段附加到仪表盘
 * @param {Object} fragmentsMap - 仪表盘和文档片段的映射
 */
function appendFragmentsToDashboards(fragmentsMap) {
    Object.values(fragmentsMap).forEach(({ dashboard, fragment }) => {
        if (fragment.children.length > 0) {
            dashboard.appendChild(fragment);
        }
    });
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
    if (group.groupType === GROUP_TYPE_WEBSITE) {
        return renderWebsiteGroup(group, websites);
    } else if (group.groupType === GROUP_TYPE_DOCKER) {
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
    const groupDiv = createGroupElement(group, CLASS_WEBSITE_GROUP);
    const listId = `website-list-${group.id}`;
    const listContainer = createListContainer(listId);

    groupDiv.appendChild(listContainer);

    websites
        ?.filter(website => website.groupId === group.id)
        .forEach(website => {
            const websiteItem = createWebsiteItem(website);
            listContainer.appendChild(websiteItem);
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
    const groupDiv = createGroupElement(group, CLASS_DOCKER_GROUP);
    const listId = `docker-list-${group.id}`;
    const listContainer = createListContainer(listId);

    groupDiv.appendChild(listContainer);

    dockers
        ?.filter(docker => docker.groupId === group.id)
        .forEach(docker => {
            const dockerItem = createDockerItem(docker);
            listContainer.appendChild(dockerItem);
        });

    return groupDiv;
}

/**
 * 创建分组的 DOM 元素
 * @param {object} group - 分组对象
 * @param {string} className - 分组的 CSS 类名
 * @returns {HTMLDivElement} - 分组的 DOM 元素
 */
function createGroupElement(group, className) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add(className);
    groupDiv.setAttribute('draggable', true);
    groupDiv.id = `${group.id}`;
    groupDiv.setAttribute('groupType', group.groupType);

    groupDiv.innerHTML = `
        <h2 id="${className}-title-${group.id}" class="${className}__title">
            ${group?.name}
            <span class="quickly-item-add-button">+</span>
        </h2>
    `;

    return groupDiv;
}

/**
 * 创建分组内的列表容器
 * @param {string} listId - 列表容器的 ID
 * @returns {HTMLDivElement} - 列表容器的 DOM 元素
 */
function createListContainer(listId) {
    const listContainer = document.createElement('div');
    listContainer.classList.add(`${listId.split('-')[0]}-list`);
    listContainer.id = listId;
    return listContainer;
}

/**
 * 创建网站项的 DOM 元素
 * @param {object} website - 网站对象
 * @returns {HTMLDivElement} - 网站项的 DOM 元素
 */
function createWebsiteItem(website) {
    const websiteItem = document.createElement('div');
    websiteItem.classList.add(CLASS_WEBSITE_ITEM);
    websiteItem.setAttribute(DATA_DESCRIPTION, website.description);
    websiteItem.setAttribute(DATA_ITEM_ID, website.id);
    websiteItem.setAttribute(DATA_GROUP_ID, website.groupId);

    websiteItem.innerHTML = `
        ${website.faviconUrl ? `<img src="${getFullUrl(website.faviconUrl)}" title="${website.name}" alt="Image" loading="lazy">` : ''}
        <a href="${website.url}" target="_blank" class="website-item__link">${website.name}</a>
    `;

    return websiteItem;
}

/**
 * 创建 Docker 项的 DOM 元素
 * @param {object} docker - Docker 容器对象
 * @returns {HTMLDivElement} - Docker 项的 DOM 元素
 */
function createDockerItem(docker) {
    const dockerItem = document.createElement('div');
    dockerItem.classList.add(CLASS_DOCKER_ITEM);
    dockerItem.setAttribute(DATA_DESCRIPTION, docker.description);
    dockerItem.setAttribute(DATA_ITEM_ID, docker.id);
    dockerItem.setAttribute(DATA_GROUP_ID, docker.groupId);
    dockerItem.setAttribute(DATA_DOCKER_SERVER_IP, docker.server);
    dockerItem.setAttribute(DATA_DOCKER_SERVER_PORT, docker.serverPort);
    dockerItem.setAttribute(DATA_DOCKER_URLPORT, docker.urlPort);

    dockerItem.innerHTML = `
        <div class="docker-item-header">
            <div class="docker-item-title">
                ${docker.faviconUrl ? `<img src="${getFullUrl(docker.faviconUrl)}" title="${docker.name}" alt="Image" loading="lazy">` : ''}
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

    return dockerItem;
}

/**
 * 获取完整的 URL
 * @param {string} url - 原始 URL
 * @returns {string} - 完整的 URL
 */
function getFullUrl(url) {
    return url.startsWith('http') ? url : backendUrl + url;
}

/**
 * 使用数据渲染主仪表盘（包括网站和 Docker）
 */
export async function renderMainDashboardWithData() {
    const WEBSITE_DASHBOARD = document.getElementById(WEBSITE_DASHBOARD_ID);
    WEBSITE_DASHBOARD.classList.add(LOADING_CLASS);

    try {
        const data = await fetchMainDashboardData();
        if (data) {
            renderMainDashboard(data);
            showNotification('数据加载成功', NOTIFICATION_SUCCESS);
        }
    } finally {
        WEBSITE_DASHBOARD.classList.remove(LOADING_CLASS);

        if (isRandomColorsEnabled()) {
            setRandomGroupColors();
        } else {
            resetGroupColors();
        }
    }
}