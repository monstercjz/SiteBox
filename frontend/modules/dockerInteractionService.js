// frontend/modules/dockerInteractionService.js

import { dockerOperationService } from './dockerOperationService.js';
import * as dockerDataService from './dockerDataService.js';
import { showNotification } from './dashboardDataService.js';

// 处理添加 Docker 容器的逻辑
export async function addDockerContainer() {
    console.log('addDockerContainer called');
    // 1. 调用 dockerOperationService.js 创建模态框，获取用户输入
    dockerOperationService.openAddDockerModal({
        callback: async (containerInfo) => {
            if (!containerInfo) {
                return; // 用户取消操作
            }

            // 2. 调用 dockerDataService.js 将容器信息发送到后端 API
            try {
                const result = await dockerDataService.addDockerContainer(containerInfo);
                console.log('添加 Docker 容器成功', result);
                // TODO: 成功添加容器后的处理，例如刷新仪表盘
                showNotification('Docker 容器添加成功', 'success');
            } catch (error) {
                console.error('添加 Docker 容器失败', error);
                showNotification('Docker 容器添加失败', 'error');
            }
        }
    });
}

// 处理修改 Docker 容器的逻辑
// 编辑 Docker 容器
export async function editDockerContainer(containerId) {
    console.log('editDockerContainer called', containerId);
    // 1. 调用 dockerOperationService.js 创建编辑模态框，获取用户输入
    dockerOperationService.openEditDockerModal({
        containerId: containerId,
        callback: async (containerInfo) => {
            if (!containerInfo) {
                return; // 用户取消操作
            }

            // 2. 调用 dockerDataService.js 将容器信息发送到后端 API
            try {
                const result = await dockerDataService.editDockerContainer(containerId, containerInfo);
                console.log('修改 Docker 容器成功', result);
                // TODO: 成功修改容器后的处理，例如刷新仪表盘
                showNotification('Docker 容器修改成功', 'success');
            } catch (error) {
                console.error('修改 Docker 容器失败', error);
                showNotification('Docker 容器修改失败', 'error');
            }
        }
    });
}

// 处理删除 Docker 容器的逻辑
export async function deleteDockerContainer(containerId) {
    console.log('deleteDockerContainer called', containerId);
    // TODO: 实现删除 Docker 容器的逻辑
}

