import { renderDashboardWithData, showNotification } from './websiteDashboardService.js';
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
            groupType: 'website', // 默认网站分组
            callback: async ({ newGroupName, groupType }) => { // 接收 groupType
                const groupSaveService = new GroupSaveService();
                const result = await groupSaveService.saveGroup(null, { // 传递 groupType
                    name: newGroupName,
                    isCollapsible: false
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
    try {
        await groupOperationService.openGroupModal({
            groupId,
            mode: 'edit',
            groupType: groupType, // 使用传递的 groupType
            callback: async ({ newGroupName, groupType }) => { // 接收 groupType
                const result = await groupSaveService.saveGroup(groupId, {
                    name: newGroupName,
                    isCollapsible: false
                }, groupType); // 传递 groupType
                if (result) {
                    const groupDiv = document.querySelector(`#group-${groupId}`);
                    if (groupDiv) {
                        groupDiv.querySelector('h2').textContent = newGroupName;
                        groupDiv.setAttribute('data-group-id', groupId);
                        groupDiv.id = `group-${groupId}`;
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
        await groupSaveService.deleteGroup(groupId, deleteOption);

        // 更新UI
        const groupElement = document.querySelector(`#group-${groupId}`);
        if (groupElement) {
            groupElement.remove();
        }
    } catch (error) {
        console.error('Failed to delete group:', error);
        showNotification('删除分组失败', 'error');
    }
}
