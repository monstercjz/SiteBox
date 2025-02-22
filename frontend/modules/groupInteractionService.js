import { showNotification } from './utils.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { hideContextMenu } from './contextMenu.js';
import { confirmGroupDelete } from './groupDeleteService.js';
import { GroupOperationService } from './groupOperationService.js';
import { GroupSaveService } from './groupDataService.js';
import { domremoveGroup,domaddGroup } from './mainDashboardServiceOrderFirst.js';
import {
    NOTIFICATION_ADD_GROUP_FAIL,
    NOTIFICATION_EDIT_GROUP_FAIL,
    NOTIFICATION_DELETE_GROUP_FAIL,
    MODAL_TITLE_DELETE_GROUP,
    MODAL_OPTION_PERMANENT_DELETE,
    MODAL_OPTION_MOVE_TO_TRASH,
    DATA_GROUP_ID,
    DATA_GROUP_TYPE,
    DATA_DASHBOARD_TYPE,
    GROUP_TYPE_WEBSITE,
    GROUP_TYPE_DOCKER,
    DASHBOARD_TYPE_WEBSITE,
    DASHBOARD_TYPE_DOCKER,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    DEFAULT_GROUP_TYPE,
    SELECTOR_GROUP_TEMPLATE,
    GROUP_NAME,
} from '../config.js';

const groupOperationService = new GroupOperationService();
const groupSaveService = new GroupSaveService();

// 添加分组
export async function addGroup() {
    try {
        await groupOperationService.openGroupModal({
            mode: 'add',
            groupType: DEFAULT_GROUP_TYPE, // 默认网站分组
            callback: async ({ newGroupName, groupType, dashboardType }) => {
                const result = await groupSaveService.saveGroup(null, {
                    name: newGroupName,
                    isCollapsible: false,
                    groupType: groupType, // 分组类型：website-group 或 docker-group
                    dashboardType: dashboardType, // 仪表盘类型: website 或 docker
                }, groupType);
                if (result) {
                    domaddGroup(result);
                    // renderDashboardWithData();
                }
            },
        });
    } catch (error) {
        console.error('Failed to add group:', error);
        showNotification(NOTIFICATION_ADD_GROUP_FAIL, 'error');
    }
}

// 编辑分组
export async function editGroup(groupId, groupType) {
    
    try {
        await groupOperationService.openGroupModal({
            groupId,
            mode: 'edit',
            groupType: groupType, // 使用传递的 groupType
            callback: async ({ newGroupName, groupType, dashboardType }) => {
                
                const result = await groupSaveService.saveGroup(groupId, {
                    name: newGroupName,
                    isCollapsible: false,
                    groupType: groupType, // 分组类型：website-group 或 docker-group
                    dashboardType: dashboardType, // 仪表盘类型: website 或 docker
                }, groupType); // 传递 groupType
                if (result) {
                    const groupDiv = document.querySelector(SELECTOR_GROUP_TEMPLATE(groupType, groupId));
                    const groupNameSpan = groupDiv.querySelector(`.${GROUP_NAME}`);
                    
                    
                    if (groupDiv) {
                        groupNameSpan.textContent = newGroupName;
                        groupDiv.setAttribute(DATA_GROUP_ID, groupId);
                        groupDiv.id = `${groupId}`;
                    }
                }
            },
        });
    } catch (error) {
        console.error('Failed to edit group:', error);
        showNotification(NOTIFICATION_EDIT_GROUP_FAIL, 'error');
    }
}

// 删除分组
export async function deleteGroup(groupId, groupType) {
    try {
        // 获取删除选项
        const deleteOption = await confirmGroupDelete({
            title: MODAL_TITLE_DELETE_GROUP,
            message: '请选择删除选项:',
            options: [
                { id: OPTION_ID_PERMANENT_DELETE, label: MODAL_OPTION_PERMANENT_DELETE },
                { id: OPTION_ID_MOVE_TO_TRASH, label: MODAL_OPTION_MOVE_TO_TRASH },
            ],
        });
        
        if (!deleteOption) return;

        // 执行删除操作
        await groupSaveService.deleteGroup(groupId, deleteOption, groupType);
        // 调用统一接口更新 UI
        domremoveGroup(groupId);
        // 更新 UI
        // const groupElement = document.querySelector(SELECTOR_GROUP_TEMPLATE(groupType, groupId));
        // if (groupElement) {
        //     groupElement.remove();
        // }
    } catch (error) {
        console.error('Failed to delete group:', error);
        showNotification(NOTIFICATION_DELETE_GROUP_FAIL, 'error');
    }
}