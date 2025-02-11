import { renderDashboardWithData, showNotification } from './dashboardDataService.js';
import { reorderWebsiteGroups } from './api.js';

let dashboard;
let saveTimeout;

// 初始化拖拽排序功能
function initGroupOrderService() {
    // 获取dashboard元素并验证其存在性
    dashboard = document.getElementById('dashboard');
    if (!dashboard) {
        console.error('Dashboard element not found');
        return;
    }

    // 绑定事件监听器
    dashboard.addEventListener('dragstart', handleDragStart);
    dashboard.addEventListener('dragover', handleDragOver);
    dashboard.addEventListener('dragleave', handleDragLeave);
    dashboard.addEventListener('drop', handleDrop);
}

// 添加防抖的saveGroupOrder函数
function debouncedSaveGroupOrder() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveGroupOrder(), 300);
}

// 处理dragstart事件
function handleDragStart(e) {
    const group = e.target.closest('.group');
    if (!group) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', group.id);
}

// 处理dragover事件
function handleDragOver(e) {
    e.preventDefault();
    // 添加视觉反馈
    const targetGroup = e.target.closest('.group');
    if (targetGroup) {
        targetGroup.classList.add('drag-over');
    }
}

// 处理dragleave事件
function handleDragLeave(e) {
    const targetGroup = e.target.closest('.group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }
}

// 处理drop事件
function handleDrop(e) {
    e.preventDefault();
    
    // 移除视觉反馈
    const targetGroup = e.target.closest('.group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }
    
    const draggedGroupId = e.dataTransfer.getData('text/plain');
    if (!targetGroup || targetGroup.id === draggedGroupId) return;

    const draggedGroup = document.getElementById(draggedGroupId);
    if (!draggedGroup) {
        console.error('Dragged group not found');
        return;
    }

    const draggedIndex = Array.from(dashboard.children).indexOf(draggedGroup);
    const targetIndex = Array.from(dashboard.children).indexOf(targetGroup);
    
    if (draggedIndex < targetIndex) {
        dashboard.insertBefore(draggedGroup, targetGroup.nextSibling);
    } else {
        dashboard.insertBefore(draggedGroup, targetGroup);
    }
    
    debouncedSaveGroupOrder();
}

// 保存分组顺序
async function saveGroupOrder() {
    if (!dashboard) {
        console.error('Dashboard element not found');
        return;
    }

    // 显示loading状态
    dashboard.classList.add('loading');

    try {
        // 获取所有group元素的id，去掉"group-"前缀得到完整UUID
        const groupIds = Array.from(document.querySelectorAll('.group'))
            .map(group => group.id.replace('group-', ''));
        
        // 根据当前顺序生成orderedGroups数组
        const orderedGroups = groupIds.map((id, index) => ({ id: id, order: index + 1 }));
        
        const updateResponse = await reorderWebsiteGroups(orderedGroups);
        if (!updateResponse) {
            throw new Error('Failed to update group order');
        }
        
        // 成功提示
        showNotification('分组顺序已保存', 'success');
        
        // 重新渲染dashboard
        await renderDashboardWithData();
        
    } catch (error) {
        console.error('Failed to save group order:', error);
        showNotification('保存分组顺序失败: ' + error.message, 'error');
    } finally {
        // 移除loading状态
        dashboard.classList.remove('loading');
    }
}

// 初始化服务
initGroupOrderService();
