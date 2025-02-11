// frontend/modules/dockerDashboardService.js

import * as dockerDataService from './dockerDataService.js';
import * as dockerInteractionService from './dockerInteractionService.js';
import { backendUrl } from '../config.js';

// 渲染 Docker 容器仪表盘
export async function renderDockerDashboard() {
    console.log('renderDockerDashboard called');
    const dashboard = document.getElementById('dashboard');
    const dockerDashboardElement = document.createElement('div');
    dockerDashboardElement.id = 'docker-dashboard';
    dashboard.appendChild(dockerDashboardElement);

    // 1. 调用 dockerDataService.js 获取 Docker 容器列表
    const dockerContainers = await dockerDataService.getDockerContainers(); // TODO: 实现 getDockerContainers 函数

    // 2. 渲染 Docker 容器列表到页面
    if (dockerContainers && dockerContainers.length > 0) {
        dockerDashboardElement.innerHTML = ''; // 清空现有内容
        const dockerListElement = document.createElement('ul');
        dockerListElement.className = 'docker-list'; // 添加 Docker 容器列表样式
        dockerContainers.forEach(container => {
            const dockerItemElement = createDockerItemElement(container);
            dockerListElement.appendChild(dockerItemElement);
        });
        dockerDashboardElement.appendChild(dockerListElement);
    } else {
        dockerDashboardElement.innerHTML = '<p>没有 Docker 容器信息</p>'; // 显示没有 Docker 容器的提示信息
    }
}

// 创建单个 Docker 容器项的 HTML 元素
function createDockerItemElement(container) {
    const dockerItemElement = document.createElement('li');
    dockerItemElement.className = 'docker-item'; // 添加 Docker 容器项样式
    dockerItemElement.innerHTML = `
        <div class="docker-item-content">
            <h3 class="docker-container-name">${container.containerName}</h3>
            <p class="docker-access-info">访问地址: ${container.accessIp}:${container.accessPort}</p>
            <p class="docker-api-info">API 地址: ${container.dockerApiAddress}:${container.dockerApiPort}</p>
        </div>
        <div class="docker-item-actions">
            <button class="edit-docker-button" data-container-id="${container.id}">编辑</button>
            <button class="delete-docker-button" data-container-id="${container.id}">删除</button>
        </div>
    `;

    // 添加编辑按钮事件监听器
    const editButton = dockerItemElement.querySelector('.edit-docker-button');
    editButton.addEventListener('click', () => {
        const containerId = editButton.dataset.containerId;
        dockerInteractionService.editDockerContainer(containerId); // TODO: 实现 editDockerContainer 函数
    });

    // 添加删除按钮事件监听器
    const deleteButton = dockerItemElement.querySelector('.delete-docker-button');
    deleteButton.addEventListener('click', () => {
        const containerId = deleteButton.dataset.containerId;
        dockerInteractionService.deleteDockerContainer(containerId); // TODO: 实现 deleteDockerContainer 函数
    });

    return dockerItemElement;
}