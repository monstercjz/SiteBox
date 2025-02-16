//分dashboard排序
import { showNotification } from './websiteDashboardService.js';
import { getWebsiteGroups, getWebsites, getAllDockers,getDockerGroups } from './api.js';
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
    console.log(data);
    const websitedashboard = document.getElementById('websitedashboard');
    const dockerdashboard = document.getElementById('dockerdashboard');//添加docker仪表盘
    const main=document.querySelector('main');//添加主体添加main
    websitedashboard.innerHTML = '';
    dockerdashboard.innerHTML = '';//清空dashboard
    main.innerHTML = '';//清空主体
    const fragment = document.createDocumentFragment();    
    const websitefragment = renderDashboard(data,fragment); 
    console.log(fragment);
    websitedashboard.appendChild(websitefragment);
    const fragments = document.createDocumentFragment(); 
    const newfragment= renderDockerDashboard(data,fragments);
    dockerdashboard.appendChild(newfragment);
    main.appendChild(websitedashboard);//将website仪表盘添加到main
    main.appendChild(dockerdashboard);//将docker仪表盘添加到main
    
}

/**
 * 渲染仪表盘
 * @param {object} data - 包含网站和分组数据的对象
 * @param {Array} data.websites - 网站列表
 * @param {Array} data.groups - 分组列表
 */
function renderDashboard({ websites, websiteGroups },fragment) {

    console.log(websiteGroups);
    const orderedGroups = (websiteGroups || []).sort((a, b) => a.order - b.order);

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
    return fragment
}
/**
 * Render Docker dockerdashboard
 * @param {object} data - Data containing docker dockers and groups
 * @param {Array} data.dockers - Docker dockers list
 * @param {Array} data.groups - Docker groups list
 */
function renderDockerDashboard({ dockers, dockerGroups },fragment) {
    
    const orderedGroups = (dockerGroups || []).sort((a, b) => a.order - b.order);

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
                    <div class="docker-item-title">
                        ${docker.faviconUrl ? `<img src="${docker.faviconUrl.startsWith('http') ? docker.faviconUrl : backendUrl + docker.faviconUrl}" title="${docker.name}" alt="Image" loading="lazy" ">` : ''}
                    
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
        fragment.appendChild(groupDiv);
    });
    
    return fragment

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