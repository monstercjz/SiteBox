import { showNotification } from './websiteDashboardService.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { DockerSaveService } from './dockerDataService.js';
import { hideContextMenu } from './contextMenu.js';
import { backendUrl } from '../config.js';
import { DockerOperationService } from './dockerOperationService.js';
import { confirmWebsiteDelete } from './websiteDeleteService.js';
import { DockerTooltipService } from './DockerTooltipService.js'; // 导入 DockerTooltipService
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

let currentEditDockerGroupId = null;
let currentEditDockerId = null;
const dockerOperationService = new DockerOperationService();
const dockerTooltipService = new DockerTooltipService(); // 创建 DockerTooltipService 实例

// 添加 Docker
export async function addDocker() {
    try {
        await dockerOperationService.openDockerModal({
            mode: 'add',
            callback: async ({ dockerName, newAccessIp, accessPort, dockerApiAddress, dockerApiPort, dockerDescription, groupSelect }) => {
                const dockerSaveService = new DockerSaveService();
                const dockerData = {
                    name: dockerName,
                    url: newAccessIp,
                    urlPort: accessPort,
                    server: dockerApiAddress,
                    serverPort: dockerApiPort,
                    description: dockerDescription,
                };
                const result = await dockerSaveService.saveDocker(null, dockerData, groupSelect);
                if (result) {
                    renderDashboardWithData();
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
        callback: async ({ dockerName, newAccessIp, accessPort, dockerApiAddress, dockerApiPort, dockerDescription, groupSelect }) => {
            console.log(newAccessIp);
            const dockerSaveService = new DockerSaveService();
            const dockerData = {
                groupId: groupSelect,
                name: dockerName,
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
        renderDashboardWithData();
    } catch (error) {
        console.error('Failed to delete Docker:', error);
        showNotification(NOTIFICATION_DELETE_DOCKER_FAIL, NOTIFICATION_TYPE_ERROR);
    }
}

// 处理 Docker 悬停事件
export async function handleDockerHover(target) {
    console.log('handleDockerHover called');
    await dockerTooltipService.handleDockerHover(target); // 调用 dockerTooltipService 的 handleDockerHover 方法
}