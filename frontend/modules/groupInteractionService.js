import { showNotification } from './websiteDashboardService.js';
import { renderDashboardWithData} from './mainDashboardService.js';
import { hideContextMenu } from './contextMenu.js';
import { confirmGroupDelete } from './groupDeleteService.js';
import { GroupOperationService } from './groupOperationService.js';
import { GroupSaveService } from './groupDataService.js';

const groupOperationService = new GroupOperationService();
const groupSaveService = new GroupSaveService();

// 添加分组
export async function addGroup() {
    try {
        await groupOperationService.openGroupModal({
            mode: 'add',
            groupType: 'website-group', // 默认网站分组
            callback: async ({ newGroupName, groupType,dashboardType }) => { // 接收 groupType
                const groupSaveService = new GroupSaveService();
                const result = await groupSaveService.saveGroup(null, { // 传递 groupType
                    name: newGroupName,
                    isCollapsible: false,
                    groupType : groupType, // 分组类型：website-group 或 docker-group
                    dashboardType: dashboardType // 仪表盘类型: website 或 docker
                }, groupType);
                if (result) {
                    renderDashboardWithData();
                }
            }
        });
    } catch (error) {
        console.error('Failed to add group:', error);
        showNotification('添加分组失败', 'error');
    }
}

// 编辑分组
export async function editGroup(groupId, groupType) {
    console.log('editGroup called', groupId, groupType);
    try {
        await groupOperationService.openGroupModal({
            groupId,
            mode: 'edit',
            groupType: groupType, // 使用传递的 groupType
            callback: async ({ newGroupName, groupType ,dashboardType}) => { // 接收 groupType
                console.log('newGrouptype:', groupType);
                const result = await groupSaveService.saveGroup(groupId, {
                    name: newGroupName,
                    isCollapsible: false,
                    groupType : groupType, // 分组类型：website-group 或 docker-group
                    dashboardType: dashboardType // 仪表盘类型: website 或 docker
                }, groupType); // 传递 groupType
                if (result) {
                    // const groupDiv = document.querySelector(`#website-group-${groupId}`);
                    // if (groupDiv) {
                    //     groupDiv.querySelector('h2').textContent = newGroupName;
                    //     groupDiv.setAttribute('data-group-id', groupId);
                    //     groupDiv.id = `website-group-${groupId}`;
                    // }
                    // groupInteractionService.js
                    const groupDiv = document.querySelector(`#${groupType.replace('-group', '')}-group-${groupId}`);
                    if (groupDiv) {
                        groupDiv.querySelector('h2').textContent = newGroupName;
                        groupDiv.setAttribute('data-group-id', groupId);
                        groupDiv.id = `${groupType.replace('-group', '')}-group-${groupId}`;
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to edit group:', error);
        showNotification('编辑分组失败', 'error');
    }
}

// 删除分组
export async function deleteGroup(groupId, groupType) {
    try {
        // 获取删除选项
        const deleteOption = await confirmGroupDelete({
            title: '删除分组',
            message: '请选择删除选项:',
            options: [
                { id: 'permanentDelete', label: '永久删除分组和网站' },
                { id: 'moveToTrash', label: '将网站移动到回收站' }
            ]
        });
        console.log('deleteOption:', deleteOption);
        if (!deleteOption) return;

        // 执行删除操作
        await groupSaveService.deleteGroup(groupId, deleteOption, groupType);

        // 更新UI
        const groupElement = document.querySelector(`#${groupType.replace('-group', '')}-group-${groupId}`);
        if (groupElement) {
            groupElement.remove();
        }
    } catch (error) {
        console.error('Failed to delete group:', error);
        showNotification('删除分组失败', 'error');
    }
}
