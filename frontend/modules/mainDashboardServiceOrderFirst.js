import { showNotification } from './utils.js';
// import { SELECTORS, elements, initializeDOMElements } from './eventDomManager.js';
import { loadModule,getCacheMemoryUsage } from "./loadModule.js";
import { backendUrl } from '../config.js';
import { createAndRunWorker } from './utils.js';
import { initializeDockerItemCache, updateDockerItemCache, removeDockerItemFromCache } from './dockerCache.js';
import { dockerUpdateInfoAll } from './dockerIfonUpdate.js';
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
    GROUP_NAME,
    DATA_DOCKER_NAME,
} from '../config.js';

/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 * @returns {Promise<object|null>} - 返回包含网站和 Docker 数据的对象，如果获取失败则返回 null
 */
// async function fetchMainDashboardData() {
//     try {
//         const websiteGroups = await getWebsiteGroups();
//         const websites = await getWebsites();
//         const dockerGroups = await getDockerGroups();
//         const dockers = await getAllDockers();

//         // 验证数据是否为数组
//         if (!Array.isArray(websiteGroups)) {
//             console.error('Website Groups data is not an array:', websiteGroups);
//         }
//         if (!Array.isArray(websites)) {
//             console.error('Websites data is not an array:', websites);
//         }
//         if (!Array.isArray(dockerGroups)) {
//             console.error('Docker Groups data is not an array:', dockerGroups);
//         }
//         if (!Array.isArray(dockers)) {
//             console.error('Docker containers data is not an array:', dockers);
//         }

//         return {
//             websiteGroups: Array.isArray(websiteGroups) ? websiteGroups : [],
//             websites: Array.isArray(websites) ? websites : [],
//             dockerGroups: Array.isArray(dockerGroups) ? dockerGroups : [],
//             dockers: Array.isArray(dockers) ? dockers : [],
//         };
//     } catch (error) {
//         console.error('Failed to fetch main dashboard data:', error);
//         showNotification('数据加载失败，请重试', NOTIFICATION_ERROR);
//         return null;
//     }
// }

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
    // const allGroups = [...data.websiteGroups, ...data.dockerGroups].sort((a, b) => a.order - b.order);

    // 创建文档片段以优化 DOM 操作
    const fragmentWebsite = document.createDocumentFragment();
    const fragmentDocker = document.createDocumentFragment();

    // 根据 group.dashboardType 和 group.groupType 渲染分组
    data.allGroups.forEach(group => {
        //每个分组，添加list,再添加item
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

    // 使用文档片段批量渲染子项
    const itemFragment = document.createDocumentFragment();
    websites
        ?.filter(website => website.groupId === group.id)
        .forEach(website => {
            itemFragment.appendChild(createWebsiteItem(website));
        });

    listContainer.appendChild(itemFragment);
    groupDiv.appendChild(listContainer);
    return groupDiv;
}
// function renderWebsiteGroup(group, websites) {
//     const groupDiv = createGroupElement(group, CLASS_WEBSITE_GROUP);
//     const listId = `website-list-${group.id}`;
//     const listContainer = createListContainer(listId);

//     groupDiv.appendChild(listContainer);

//     websites
//         ?.filter(website => website.groupId === group.id)
//         .forEach(website => {
//             const websiteItem = createWebsiteItem(website);
//             listContainer.appendChild(websiteItem);
//         });

//     return groupDiv;
// }


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

    // 使用文档片段批量渲染子项
    const itemFragment = document.createDocumentFragment();
    // const dockerItems = []; // 临时存储创建的 Docker 项由于在dockercache里添加了是否已经真实加到了dom验证，此处添加都会失败，因为这个时候都只是添加到临时页面文档，其实还在内存里
    dockers
        ?.filter(docker => docker.groupId === group.id)
        .forEach(docker => {
            const dockerItem = createDockerItem(docker);
            itemFragment.appendChild(dockerItem);
            // dockerItems.push(dockerItem); // 暂存 Docker 项
        });
    listContainer.appendChild(itemFragment);
    groupDiv.appendChild(listContainer);
    // 统一更新缓存
    // dockerItems.forEach(dockerItem => updateDockerItemCache(dockerItem));
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
            <span class="${GROUP_NAME}">${group?.name}</span>
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
    dockerItem.setAttribute(DATA_DOCKER_NAME, docker.name);
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
                <a href="${docker.url}:${docker.urlPort}" target="_blank" class="docker-item__link">${docker.displayName}</a>
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
    // 缓存子元素引用
    dockerItem._cpuValue = dockerItem.querySelector('.docker-item-cpu .docker-item-stats-value');
    dockerItem._networkReceiveValue = dockerItem.querySelector('.docker-item-networkIo-receive .docker-item-stats-value');
    dockerItem._networkSendValue = dockerItem.querySelector('.docker-item-networkIo-send .docker-item-stats-value');
    dockerItem._statusIndicator = dockerItem.querySelector('.docker-status-indicator');
    // 更新缓存,停止此处的更新，直接入口统一更新
    // updateDockerItemCache(dockerItem);
    return dockerItem;
}
/**
 * 动态添加 Docker 项
 * @param {object} docker - 新增的 Docker 数据对象
 */
export function domaddDockerItem(docker) {
    const listContainer = document.getElementById(`docker-list-${docker.groupId}`);
    if (!listContainer) {
        console.error(`Failed to find the container for group ID: ${docker.groupId}`);
        return;
    }

    // 创建新的 Docker 项
    const dockerItem = createDockerItem(docker);
    listContainer.appendChild(dockerItem);

    // 更新缓存
    updateDockerItemCache(dockerItem);
}

/**
 * 动态删除 Docker 项
 * @param {string} dockerId - 要删除的 Docker ID
 */
export function domremoveDockerItem(dockerId) {
    const dockerItem = document.querySelector(`[${DATA_ITEM_ID}="${dockerId}"]`);
    if (!dockerItem) {
        console.error(`Failed to find Docker item with ID: ${dockerId}`);
        return;
    }

    // 从 DOM 中移除
    dockerItem.remove();

    // 从缓存中移除
    removeDockerItemFromCache(dockerId);

}

/**
 * 动态添加分组
 * @param {object} group - 新增的分组数据对象
 */
export function domaddGroup(group) {
    const dashboardType = group.dashboardType;
    const dashboard = document.getElementById(
        dashboardType === DASHBOARD_TYPE_WEBSITE ? WEBSITE_DASHBOARD_ID : DOCKER_DASHBOARD_ID
    );
    if (!dashboard) {
        console.error(`Failed to find dashboard for type: ${dashboardType}`);
        return;
    }

    // 创建新的分组
    const groupDiv = createGroupElement(group, group.groupType === GROUP_TYPE_WEBSITE ? CLASS_WEBSITE_GROUP : CLASS_DOCKER_GROUP);
    const listId = `${group.groupType}-list-${group.id}`;
    const listContainer = createListContainer(listId);
    groupDiv.appendChild(listContainer);

    // 插入到仪表盘中
    dashboard.appendChild(groupDiv);
}

/**
 * 动态删除分组
 * @param {string} groupId - 要删除的分组 ID
 */
export function domremoveGroup(groupId) {
    const groupDiv = document.getElementById(`${groupId}`);
    if (!groupDiv) {
        console.error(`Failed to find group with ID: ${groupId}`);
        return;
    }

    // 从 DOM 中移除
    groupDiv.remove();
}

/**
 * 动态添加网站项
 * @param {object} website - 新增的网站数据对象
 */
export function domaddWebsiteItem(website) {
    const listContainer = document.getElementById(`website-list-${website.groupId}`);
    if (!listContainer) {
        console.error(`Failed to find the container for group ID: ${website.groupId}`);
        return;
    }

    // 创建新的网站项
    const websiteItem = createWebsiteItem(website);
    listContainer.appendChild(websiteItem);

    // 如果需要缓存网站项，可以在这里扩展逻辑
}

/**
 * 动态删除网站项
 * @param {string} websiteId - 要删除的网站 ID
 */
export function domremoveWebsiteItem(websiteId) {
    const websiteItem = document.querySelector(`[${DATA_ITEM_ID}="${websiteId}"]`);
    if (!websiteItem) {
        console.error(`Failed to find website item with ID: ${websiteId}`);
        return;
    }

    // 从 DOM 中移除
    websiteItem.remove();

    // 如果有缓存逻辑，可以在这里扩展
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
 * 使用 Web Worker 获取主仪表盘数据
 * @returns {Promise} - 返回包含网站和 Docker 数据的对象，如果获取失败则返回 null
 */
async function fetchMainDashboardDataWithWorker() {
    try {
        const workerPath = './dashboardWorker.js';
        const message = 'fetchData';
        return await createAndRunWorker(workerPath, message);
    } catch (error) {
        console.error('Failed to fetch data with worker:', error);
        throw error; // 重新抛出错误以便进一步处理
    }
}
export async function setTheme() {
    const { setRandomGroupColors, resetGroupColors, isRandomColorsEnabled, loadColorPreference } = await loadModule('./h2colorThemeService.js');
    // h2如果使用随机色，按钮标记为actve.
    const groupColorToggleButton = document.querySelector('#group-color-toggle');
    groupColorToggleButton.classList.toggle('active', loadColorPreference());
    //根据是否使用随即色，设置标题颜色
    if (isRandomColorsEnabled()) {
        setRandomGroupColors();
    } else {
        resetGroupColors();
    }
    const { applySavedTheme} = await loadModule('./themeService.js');
    applySavedTheme();
    const { applySavedLayout} = await loadModule('./layoutService.js');
    applySavedLayout();

}
/**
 * 使用数据渲染主仪表盘（包括网站和 Docker）
 */
export async function renderMainDashboardWithData() {
    const WEBSITE_DASHBOARD = document.getElementById(WEBSITE_DASHBOARD_ID);
    WEBSITE_DASHBOARD.classList.add(LOADING_CLASS);

    try {
        // 使用 Web Worker 获取数据
        console.time('fetchMainDashboardDataWithWorker');
        const data = await fetchMainDashboardDataWithWorker();
        console.timeEnd('fetchMainDashboardDataWithWorker');
        if (data) {
            console.time('renderMainDashboard');
            renderMainDashboard(data);
            console.timeEnd('renderMainDashboard');

            showNotification('数据加载成功', NOTIFICATION_SUCCESS);
        }
    } finally {
        WEBSITE_DASHBOARD.classList.remove(LOADING_CLASS);
        setTheme();
        console.time('querySelectorAll');
        // 延迟更新缓存
        requestIdleCallback(() => {
            const dockerItems = document.querySelectorAll('.docker-item');
            initializeDockerItemCache(dockerItems);
        });
        requestIdleCallback(() => {
            dockerUpdateInfoAll();
        });

        console.timeEnd('querySelectorAll');
        // initializeDockerItemCache();
    }
}


