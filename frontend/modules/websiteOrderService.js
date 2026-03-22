import { showNotification } from './utils.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { reorderWebsites } from './api.js';

let saveTimeout;

// 初始化网站项目拖拽排序功能
export function initWebsiteOrderService() {
    console.log('Initializing website order service...');
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard) {
        console.error('Main dashboard element not found');
        return;
    }

    // 绑定事件监听器到main元素，使用事件委托
    mainDashboard.addEventListener('dragstart', handleDragStart);
    mainDashboard.addEventListener('dragover', handleDragOver);
    mainDashboard.addEventListener('dragleave', handleDragLeave);
    mainDashboard.addEventListener('drop', handleDrop);
}

// 添加防抖的saveWebsiteOrder函数
function debouncedSaveWebsiteOrder() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveWebsiteOrder(), 300);
}

// 处理dragstart事件
function handleDragStart(e) {
    const item = e.target.closest('.website-item');
    console.log('Website dragstart - target:', e.target, 'item:', item, 'item.id:', item ? item.id : null);
    if (!item) {
        return; // 如果不是网站项目，则不处理，让其他拖拽服务处理
    }
    e.stopPropagation(); // 防止触发组拖拽
    const itemId = item.id;
    console.log('Website item drag start - itemId:', itemId);
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
}

// 处理dragover事件
function handleDragOver(e) {
    const item = e.target.closest('.website-item');
    if (!item) {
        return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    item.classList.add('drag-over');
}

// 处理dragleave事件
function handleDragLeave(e) {
    const item = e.target.closest('.website-item');
    if (item) {
        item.classList.remove('drag-over');
    }
}

// 处理drop事件
function handleDrop(e) {
    const targetItem = e.target.closest('.website-item');
    if (!targetItem) {
        return;
    }

    e.preventDefault();
    e.stopPropagation(); // 防止触发组拖拽

    // 移除视觉反馈
    targetItem.classList.remove('drag-over');

    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (!draggedItemId || targetItem.id === draggedItemId) return;

    const draggedItem = document.getElementById(draggedItemId);
    if (!draggedItem) {
        console.error('Dragged item not found');
        return;
    }

    // 确保拖拽和目标都在同一个列表容器内
    const draggedList = draggedItem.parentElement;
    const targetList = targetItem.parentElement;

    if (draggedList === targetList && draggedList) {
        const items = Array.from(draggedList.children);
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(targetItem);

        if (draggedIndex < targetIndex) {
            draggedList.insertBefore(draggedItem, targetItem.nextSibling);
        } else {
            draggedList.insertBefore(draggedItem, targetItem);
        }

        debouncedSaveWebsiteOrder();
    }
}

// 保存网站项目顺序
async function saveWebsiteOrder() {
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard) return;

    // 显示loading状态
    mainDashboard.classList.add('loading');

    try {
        // 获取所有网站列表容器
        const lists = mainDashboard.querySelectorAll('.website-list');
        const allItemsOrdered = [];

        lists.forEach(list => {
            const items = Array.from(list.children);

            items.forEach((item) => {
                if (item.classList.contains('website-item')) {
                    allItemsOrdered.push({
                        id: item.id
                    });
                }
            });
        });

        console.log('Saving website order, items:', allItemsOrdered);
        if (allItemsOrdered.length > 0) {
            const response = await reorderWebsites(allItemsOrdered);
            console.log('Reorder response:', response);
            if (response) {
                showNotification('网站顺序已保存', 'success');
            } else {
                throw new Error('Failed to save order');
            }
        }
    } catch (error) {
        console.error('Failed to save website order:', error);
        showNotification('保存网站顺序失败: ' + error.message, 'error');
    } finally {
        mainDashboard.classList.remove('loading');
    }
}

// 初始化服务
initWebsiteOrderService();