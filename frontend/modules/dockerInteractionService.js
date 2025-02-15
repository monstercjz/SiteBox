import { showNotification } from './websiteDashboardService.js';
import { renderDashboardWithData} from './mainDashboardService.js';
import { DockerSaveService } from './dockerDataService.js';
import { hideContextMenu } from './contextMenu.js';
import { backendUrl } from '../config.js';
import { DockerOperationService } from './dockerOperationService.js';
import { confirmWebsiteDelete } from './websiteDeleteService.js';
import { DockerTooltipService } from './DockerTooltipService.js'; // 导入 DockerTooltipService



let currentEditDockerGroupId = null;
let currentEditDockerId = null;
const dockerOperationService = new DockerOperationService();
const dockerTooltipService = new DockerTooltipService(); // 创建 DockerTooltipService 实例



// 获取图标函数


// 添加网站
export async function addDocker() {
    try {
        await dockerOperationService.openDockerModal({
            mode: 'add',
            callback: async ({ dockerName, newaccessIp, accessPort, dockerApiAddress,dockerApiPort,dockerDescription, groupSelect }) => {
                const dockerSaveService = new DockerSaveService();
                const dockerData = {  // 确保 dockerData 对象被正确构建
                    name: dockerName,
                    url: newaccessIp,
                    urlPort: accessPort,
                    server: dockerApiAddress,
                    serverPort: dockerApiPort,
                    description: dockerDescription
                };
                const result = await dockerSaveService.saveDocker(null, dockerData, groupSelect);  // 传递 dockerData 对象
                if (result) {
                    renderDashboardWithData();
                }
            }
        });
    } catch (error) {
        console.error('Failed to add website:', error);
        showNotification('添加网站失败', 'error');
    }
}

// 编辑网站
export async function editDocker(groupId, dockerId) {
    hideContextMenu();
    currentEditDockerGroupId = groupId;
    currentEditDockerId = dockerId;
    dockerOperationService.openDockerModal({
        mode: 'edit',
        dockerId: dockerId,
        groupId: groupId,
        callback: async ({ dockerName, newaccessIp, accessPort, dockerApiAddress,dockerApiPort,dockerDescription, groupSelect }) => {
            const dockerSaveService = new DockerSaveService();
            const dockerData = {  // 确保 dockerData 对象被正确构建
                groupId: groupSelect,
                name: dockerName,
                url: newaccessIp,
                urlPort: accessPort,
                server: dockerApiAddress,
                serverPort: dockerApiPort,
                description: dockerDescription
            };
            const result = await dockerSaveService.saveDocker(dockerId, dockerData, groupSelect);  // 传递 dockerData 对象
            if (result) {
                renderDashboardWithData();
            }
        }
    });
}

// 删除网站
export async function deleteDocker(groupId, dockerId) {
    try {
        //没有再新建一个模态框处理文件，直接调用了website的删除模态框
        const deleteOption = await confirmWebsiteDelete({
            title: '删除网站',
            message: '请选择删除选项:',
            options: [
                { id: 'permanentDelete', label: '永久删除网站' },
                { id: 'moveToTrash', label: '将网站移动到回收站' }
            ]
        });
        if (!deleteOption) return;

        const dockerSaveService = new DockerSaveService();
        await dockerSaveService.deleteDocker(dockerId, deleteOption);
        renderDashboardWithData();
    } catch (error) {
        console.error('Failed to delete website:', error);
        showNotification('删除网站失败', 'error');
    }
}

// 处理网站悬停事件 (函数名应为 handleDockerHover)
export async function handleDockerHover(target) {
    console.log('handleDockerHover called');
    await dockerTooltipService.handleDockerHover(target); // 调用 dockerTooltipService 的 handleDockerHover 方法
}




