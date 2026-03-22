import { showNotification } from './utils.js';
import { renderDashboardWithData } from './mainDashboardService.js';
import { reorderWebsites } from './api.js';

let saveTimeout;

export function initWebsiteOrderService() {
    console.log('Initializing website order service...');
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard) {
        console.error('Main dashboard element not found');
        return;
    }

    mainDashboard.addEventListener('dragstart', handleDragStart);
    mainDashboard.addEventListener('dragover', handleDragOver);
    mainDashboard.addEventListener('dragleave', handleDragLeave);
    mainDashboard.addEventListener('drop', handleDrop);
    mainDashboard.addEventListener('dragend', handleDragEnd);
}

// 将需要保存的列表容器直接作为参数传入，避免全局变量污染
function debouncedSaveWebsiteOrder(listContainer) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveWebsiteOrder(listContainer), 300);
}

function handleDragStart(e) {
    const item = e.target.closest('.website-item');
    if (!item) return;

    e.stopPropagation();
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    const item = e.target.closest('.website-item');
    if (!item) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // 避免重复添加
    if (!item.classList.contains('drag-over')) {
        item.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const item = e.target.closest('.website-item');
    // 确保鼠标真正离开了当前 item 才移除样式 (防止子元素触发冒泡导致闪烁)
    if (item && !item.contains(e.relatedTarget)) {
        item.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    const targetItem = e.target.closest('.website-item');
    if (!targetItem) return;

    e.preventDefault();
    e.stopPropagation();

    targetItem.classList.remove('drag-over');

    const droppedId = e.dataTransfer.getData('text/plain');
    if (!droppedId || targetItem.id === droppedId) return;

    const draggedItem = document.getElementById(droppedId);
    if (!draggedItem) return;

    const draggedList = draggedItem.parentElement;
    const targetList = targetItem.parentElement;

    // 只处理同组拖拽
    if (draggedList === targetList && draggedList) {
        const items = Array.from(draggedList.children);
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(targetItem);

        if (draggedIndex < targetIndex) {
            draggedList.insertBefore(draggedItem, targetItem.nextSibling);
        } else {
            draggedList.insertBefore(draggedItem, targetItem);
        }

        // 直接把当前操作的列表传给防抖函数
        debouncedSaveWebsiteOrder(draggedList);
    }
}

// 监听 dragend 清理状态
function handleDragEnd(e) {
    // 确保清理所有可能残留的反馈样式
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// 接收具体的列表容器进行保存，使函数变得纯粹且不易受外部状态干扰
async function saveWebsiteOrder(listContainer) {
    const mainDashboard = document.querySelector('main');
    if (!mainDashboard || !listContainer) return;

    mainDashboard.classList.add('loading');

    try {
        // 直接从传入的 DOM 容器中提取最新顺序
        const items = Array.from(listContainer.children);
        const itemsToSave = items
            .filter(item => item.classList.contains('website-item'))
            .map(item => ({ id: item.id }));

        if (itemsToSave.length > 0) {
            const response = await reorderWebsites(itemsToSave);
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