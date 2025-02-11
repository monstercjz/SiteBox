// frontend/modules/dockerDataService.js

import * as api from './api.js';

// 添加 Docker 容器
export async function addDockerContainer(containerInfo) {
    try {
        const response = await api.addDockerContainer(containerInfo);
        return response;
    } catch (error) {
        console.error('调用后端 API 添加 Docker 容器失败', error);
        throw error;
    }
}

// TODO: 实现修改 Docker 容器
export async function editDockerContainer(containerId, containerInfo) {
    console.log('editDockerContainer called', containerId, containerInfo);
    // TODO: 实现修改 Docker 容器
}

// TODO: 实现删除 Docker 容器
export async function deleteDockerContainer(containerId) {
    console.log('deleteDockerContainer called', containerId);
    // TODO: 实现删除 Docker 容器
}

// 获取单个 Docker 容器
export async function getDockerContainerById(containerId) {
    try {
        const response = await api.getDockerContainerById(containerId);
        return response;
    } catch (error) {
        console.error('调用后端 API 获取 Docker 容器失败', error);
        throw error;
    }
}

// 获取 Docker 容器列表
export async function getDockerContainers() {
    try {
        const response = await api.getDockerContainers();
        return response;
    } catch (error) {
        console.error('调用后端 API 获取 Docker 容器列表失败', error);
        throw error;
    }
}
