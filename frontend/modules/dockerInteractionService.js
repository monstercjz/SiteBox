import { showNotification } from './utils.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { domaddDockerItem, domremoveDockerItem } from './mainDashboardServiceOrderFirst.js';
import { DockerSaveService } from './dockerDataService.js';
import { hideContextMenu } from './contextMenu.js';
import { backendUrl } from '../config.js';
import { DockerOperationService } from './dockerOperationService.js';
import { confirmWebsiteDelete } from './websiteDeleteService.js';

import {
    NOTIFICATION_ADD_DOCKER_FAIL,
    NOTIFICATION_DELETE_DOCKER_FAIL,
    MODAL_TITLE_DELETE_DOCKER,
    MODAL_OPTION_PERMANENT_DELETE,
    MODAL_OPTION_MOVE_TO_TRASH,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    NOTIFICATION_TYPE_ERROR,
} from '../config.js';

import { dockerUpdateInfoAll } from './dockerIfonUpdate.js';

let currentEditDockerGroupId = null;
let currentEditDockerId = null;
const dockerOperationService = new DockerOperationService();




// 添加 Docker
export async function addDocker(groupId) {
    try {
        await dockerOperationService.openDockerModal({
            mode: 'add',
            groupId: groupId,
            callback: async ({ dockerName, dockerDisplayName,newAccessIp, accessPort, dockerApiAddress, dockerApiPort, dockerDescription, groupSelect }) => {
                const dockerSaveService = new DockerSaveService();
                const dockerData = {
                    name: dockerName,
                    displayName:dockerDisplayName,
                    url: newAccessIp,
                    urlPort: accessPort,
                    server: dockerApiAddress,
                    serverPort: dockerApiPort,
                    description: dockerDescription,
                };
                const result = await dockerSaveService.saveDocker(null, dockerData, groupSelect);
                if (result) {
                    //renderDashboardWithData();
                    //更新ui
                    domaddDockerItem(result);
                }
            },
        });
    } catch (error) {
        console.error('Failed to add Docker:', error);
        showNotification(NOTIFICATION_ADD_DOCKER_FAIL, NOTIFICATION_TYPE_ERROR);
    }
}

// 编辑 Docker
export async function editDocker(groupId, dockerId) {
    hideContextMenu();
    currentEditDockerGroupId = groupId;
    currentEditDockerId = dockerId;
    dockerOperationService.openDockerModal({
        mode: 'edit',
        dockerId: dockerId,
        groupId: groupId,
        callback: async ({ dockerName,dockerDisplayName, newAccessIp, accessPort, dockerApiAddress, dockerApiPort, dockerDescription, groupSelect }) => {
            
            const dockerSaveService = new DockerSaveService();
            const dockerData = {
                groupId: groupSelect,
                name: dockerName,
                displayName:dockerDisplayName,
                url: newAccessIp,
                urlPort: accessPort,
                server: dockerApiAddress,
                serverPort: dockerApiPort,
                description: dockerDescription,
            };
            const result = await dockerSaveService.saveDocker(dockerId, dockerData, groupSelect);
            if (result) {
                renderDashboardWithData();
            }
        },
    });
}

// 删除 Docker
export async function deleteDocker(groupId, dockerId) {
    try {
        // 没有再新建一个模态框处理文件，直接调用了 website 的删除模态框
        const deleteOption = await confirmWebsiteDelete({
            title: MODAL_TITLE_DELETE_DOCKER,
            message: '请选择删除选项:',
            options: [
                { id: OPTION_ID_PERMANENT_DELETE, label: MODAL_OPTION_PERMANENT_DELETE },
                { id: OPTION_ID_MOVE_TO_TRASH, label: MODAL_OPTION_MOVE_TO_TRASH },
            ],
        });
        if (!deleteOption) return;

        const dockerSaveService = new DockerSaveService();
        await dockerSaveService.deleteDocker(dockerId, deleteOption);
        //动态删除dom中的dockerItem，避免全局刷新
         domremoveDockerItem(dockerId)
         //全局刷新
        // renderDashboardWithData();
    } catch (error) {
        console.error('Failed to delete Docker:', error);
        showNotification(NOTIFICATION_DELETE_DOCKER_FAIL, NOTIFICATION_TYPE_ERROR);
    }
}



// 启动 Docker 容器
export async function startDocker(dockerItemId) {
    try {
        const dockerSaveService = new DockerSaveService(); // 创建 DockerSaveService 实例
        const response = await dockerSaveService.startDockerContainer(dockerItemId); // 使用 dockerDataService
        if (response) {
            dockerUpdateInfoAll();
        }
    } catch (error) {
        console.error('Failed to start Docker container:', error);
        showNotification('启动 Docker 容器失败', 'error');
    } finally {
        hideContextMenu();
    }
}

// 停止 Docker 容器
export async function stopDocker(dockerItemId) {
    try {
        const dockerSaveService = new DockerSaveService(); // 创建 DockerSaveService 实例
        const response = await dockerSaveService.stopDockerContainer(dockerItemId); // 使用 dockerDataService
        if (response) {
            dockerUpdateInfoAll();
        }
    } catch (error) {
        console.error('Failed to stop Docker container:', error);
        showNotification('停止 Docker 容器失败', 'error');
    } finally {
        hideContextMenu();
    }
}

// 重启 Docker 容器
export async function restartDocker(dockerItemId) {
    try {
        const dockerSaveService = new DockerSaveService(); // 创建 DockerSaveService 实例
        const response = await dockerSaveService.restartDockerContainer(dockerItemId); // 使用 dockerDataService
        
        if (response) {
            dockerUpdateInfoAll();
        }
    } catch (error) {
        console.error('Failed to restart Docker container:', error);
        showNotification('重启 Docker 容器失败', 'error');
    } finally {
        hideContextMenu();
    }
}


