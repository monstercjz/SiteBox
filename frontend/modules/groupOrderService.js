import { showNotification } from './utils.js';
import { renderDashboardWithData} from './mainDashboardService.js';
import { reorderWebsiteGroups,reorderDockerGroups, updateWebsiteGroup, updateDockerGroup } from './api.js';

let websitedashboard;
let saveTimeout;
let isGroupDragging = false; // 跟踪是否正在拖拽分组
// let dashboardTypeUpdates = []; // Array to store dashboardType updates

// 初始化拖拽排序功能
export function initGroupOrderService() {
    // 获取main元素作为拖拽容器
    console.log('Initializing group order service...');
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard) {
        console.error('Main dashboard element not found');
        return;
    }

    // 绑定事件监听器到main元素
    mainDashboard.addEventListener('dragstart', handleDragStart);
    mainDashboard.addEventListener('dragover', handleDragOver);
    mainDashboard.addEventListener('dragleave', handleDragLeave);
    mainDashboard.addEventListener('drop', handleDrop);
}

// 添加防抖的saveGroupOrder函数
function debouncedSaveGroupOrder() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveGroupOrder(), 300);
}

// 处理dragstart事件
function handleDragStart(e) {
    // 获取被拖拽的元素
    const target = e.target;

    // 检查是否直接拖拽分组容器本身（而不是其子元素）
    const isGroupContainer = (target.classList.contains('website-group') || target.classList.contains('docker-group'));

    // 检查是否拖拽分组标题（h2 元素）
    const isGroupTitle = target.closest('h2[class$="__title"]');

    // 只有当直接拖拽分组容器或分组标题时才处理
    if (isGroupContainer || isGroupTitle) {
        const group = target.closest('.website-group') || target.closest('.docker-group');
        if (!group) return;

        isGroupDragging = true; // 设置拖拽状态
        e.stopPropagation(); // 阻止事件冒泡，防止触发其他拖拽服务
        const groupId = group.id;
        const groupType = group.classList.contains('website-group') ? 'website-group' : 'docker-group';
        console.log('Group drag start - groupId:', groupId, 'groupType:', groupType);
        e.dataTransfer.setData('text/plain', groupId);
        e.dataTransfer.setData('application/group-type', groupType); // 保存 groupType
    } else {
        isGroupDragging = false; // 重置拖拽状态
    }
    // 否则不处理，让 websiteOrderService 处理
}

// 处理dragover事件
function handleDragOver(e) {
    // 如果不是分组拖拽，则不处理
    if (!isGroupDragging) {
        return;
    }

    e.preventDefault();
    // 添加视觉反馈
    const targetGroup = e.target.closest('.website-group') || e.target.closest('.docker-group');
    if (targetGroup) {
        targetGroup.classList.add('drag-over');
    }
}

// 处理dragleave事件
function handleDragLeave(e) {
    // 如果不是分组拖拽，则不处理
    if (!isGroupDragging) {
        return;
    }

    const targetGroup = e.target.closest('.website-group') || e.target.closest('.docker-group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }
}


// 处理drop事件
function handleDrop(e) {
    e.preventDefault();

    // 如果不是分组拖拽，则不处理，让 websiteOrderService 处理
    if (!isGroupDragging) {
        console.log('Group handleDrop - not a group drag, returning');
        return;
    }

    // 重置拖拽状态
    isGroupDragging = false;

    // 移除视觉反馈
    const targetGroup = e.target.closest('.website-group') || e.target.closest('.docker-group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }

    const draggedGroupId = e.dataTransfer.getData('text/plain');
    console.log('Group Drop event - draggedGroupId:', draggedGroupId, 'targetGroup:', targetGroup ? targetGroup.id : null);

    if (!targetGroup || targetGroup.id === draggedGroupId) {
        console.log('Group handleDrop - no target or same target, returning');
        return;
    }

    const draggedGroup = document.getElementById(draggedGroupId);
    if (!draggedGroup) {
        console.error('Dragged group not found, ID:', draggedGroupId);
        return;
    }

    const targetDashboard = targetGroup.closest('#websitedashboard') || targetGroup.closest('#dockerdashboard');
    const draggedDashboard = draggedGroup.closest('#websitedashboard') || draggedGroup.closest('#dockerdashboard');

    if (targetDashboard && draggedDashboard && targetDashboard === draggedDashboard) {
        // 同类型 dashboard 内排序 (保持原逻辑)
        const groupList = targetDashboard.children;
        const draggedIndex = Array.from(groupList).indexOf(draggedGroup);
        const targetIndex = Array.from(groupList).indexOf(targetGroup);

        if (draggedIndex < targetIndex) {
            targetDashboard.insertBefore(draggedGroup, targetGroup.nextSibling);
        } else {
            targetDashboard.insertBefore(draggedGroup, targetGroup);
        }
        debouncedSaveGroupOrder(); // 保存排序
    } else if (targetGroup && targetDashboard && draggedDashboard) {
        // 跨 dashboard 移动，实现容器位置互换
        const targetGroupIndex = Array.from(targetDashboard.children).indexOf(targetGroup);
        // const targetDashboardType = targetDashboard.id === 'websitedashboard' ? 'website' : 'docker'; // Determine target dashboardType

        if (targetGroupIndex !== -1) {
            targetDashboard.insertBefore(draggedGroup, targetGroup);
        } else {
            targetDashboard.appendChild(draggedGroup);
        }
        debouncedSaveGroupOrder(); // 保存排序

        // Defer dashboardType update, add to updates array
        // dashboardTypeUpdates.push({
        //     groupId: draggedGroupId,
        //     groupType: draggedGroupType,
        //     dashboardType: targetDashboardType
        // });
    }
}
// 保存分组顺序
async function saveGroupOrder() {
    // 获取 main dashboard 元素
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard) {
        console.error('Main dashboard element not found');
        return;
    }

    // 显示loading状态
    mainDashboard.classList.add('loading');

    try {
        // 获取所有 group 元素（按当前 DOM 顺序）
        const allGroups = Array.from(mainDashboard.querySelectorAll('.website-group, .docker-group'));

        // 分别构建 website group 和 docker group 的排序数据
        const orderedWebsiteGroups = [];
        const orderedDockerGroups = [];
        allGroups.forEach((group, index) => {
            let dashboardType = '';
            if (group.closest('#websitedashboard')) {
                dashboardType = 'website';
            } else if (group.closest('#dockerdashboard')) {
                dashboardType = 'docker';
            }

            if (group.classList.contains('website-group')) {
                orderedWebsiteGroups.push({
                    //: group.id.replace('website-group-', ''),
                    id: group.id,
                    order: index + 1,
                    dashboardType: dashboardType // Dynamically determine dashboardType
                });
            } else if (group.classList.contains('docker-group')) {
                orderedDockerGroups.push({
                    // id: group.id.replace('docker-group-', ''),
                    id: group.id,
                    order: index + 1,
                    dashboardType: dashboardType // Dynamically determine dashboardType
                });
            }
        });


        const websiteUpdateResponse = await reorderWebsiteGroups(orderedWebsiteGroups);
        if (!websiteUpdateResponse) {
            throw new Error('Failed to update website group order');
        }


        const dockerUpdateResponse = await reorderDockerGroups(orderedDockerGroups); // 调用 docker group 排序 API
        if (!dockerUpdateResponse) {
            throw new Error('Failed to update docker group order');
        }


        // Process dashboardType updates
        // const dashboardTypeUpdatePromises = dashboardTypeUpdates.map(update => {
        //     const { groupId, groupType, dashboardType } = update;
        //     const updatedGroupData = { dashboardType: dashboardType };
        //     if (groupType === 'website-group') {
        //         return updateWebsiteGroup(groupId, updatedGroupData);
        //     } else if (groupType === 'docker-group') {
        //         return updateDockerGroup(groupId, updatedGroupData);
        //     }
        // });

        // await Promise.all(dashboardTypeUpdatePromises); // Batch update dashboardType

        // dashboardTypeUpdates = []; // Clear updates array

        // 成功提示
        showNotification('分组顺序已保存', 'success');

        // 重新渲染dashboard
        await renderDashboardWithData();

    } catch (error) {
        console.error('Failed to save group order:', error);
        showNotification('保存分组顺序失败: ' + error.message, 'error');
    } finally {
        // 移除loading状态
        mainDashboard.classList.remove('loading');
    }
}
// 初始化服务
initGroupOrderService();
