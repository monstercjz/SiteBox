// frontend/modules/dockerDataService.js

import * as api from './api.js';

// 添加 Docker 容器
export async function addDocker(containerInfo) { // 重命名为 addDocker
    try {
        const response = await api.addDockerContainer(containerInfo);
        return response;
    } catch (error) {
        console.error('调用后端 API 添加 Docker 容器失败', error);
        throw error;
    }
}

// 修改 Docker 容器
export async function editDocker(containerId, containerInfo) { // 重命名为 editDocker
    console.log('editDocker called', containerId, containerInfo);
    // TODO: 实现修改 Docker 容器
}

//  实现删除 Docker 容器
export async function deleteDocker(dockerId) { //  重命名为 deleteDocker
    console.log('deleteDocker called', dockerId);
    try {
        const response = await api.deleteDocker(dockerId); // 调用 api.deleteDocker
        return response;
    } catch (error) {
        console.error('调用后端 API 删除 Docker 容器失败', error);
        throw error;
    }
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
