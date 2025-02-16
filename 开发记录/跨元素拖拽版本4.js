//在未添加2个group属性的时候，是正常运行了
import { showNotification } from './websiteDashboardService.js';
import { renderDashboardWithData} from './mainDashboardService.js';
import { reorderWebsiteGroups,reorderDockerGroups } from './api.js';

let websitedashboard;
let saveTimeout;

// 初始化拖拽排序功能
function initGroupOrderService() {
    // 获取main元素作为拖拽容器
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
    const group = e.target.closest('.website-group') || e.target.closest('.docker-group');
    if (!group) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    const groupId = group.id;
    const groupType = group.classList.contains('website-group') ? 'website-group' : 'docker-group';
    e.dataTransfer.setData('text/plain', groupId);
    e.dataTransfer.setData('application/group-type', groupType); // 保存 groupType
}

// 处理dragover事件
function handleDragOver(e) {
    e.preventDefault();
    // 添加视觉反馈
    const targetGroup = e.target.closest('.website-group');
    if (targetGroup) {
        targetGroup.classList.add('drag-over');
    }
}

// 处理dragleave事件
function handleDragLeave(e) {
    const targetGroup = e.target.closest('.website-group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }
}


// 处理drop事件
function handleDrop(e) {
    e.preventDefault();

    // 移除视觉反馈
    const targetGroup = e.target.closest('.website-group') || e.target.closest('.docker-group');
    if (targetGroup) {
        targetGroup.classList.remove('drag-over');
    }

    const draggedGroupId = e.dataTransfer.getData('text/plain');
    const draggedGroupType = e.dataTransfer.getData('application/group-type'); // 获取 groupType
    if (!targetGroup || targetGroup.id === draggedGroupId) return;

    const draggedGroup = document.getElementById(draggedGroupId);
    if (!draggedGroup) {
        console.error('Dragged group not found');
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

        if (targetGroupIndex !== -1) {
            targetDashboard.insertBefore(draggedGroup, targetGroup);
        } else {
            targetDashboard.appendChild(draggedGroup);
        }
        debouncedSaveGroupOrder(); // 保存排序
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
    //排序逻辑已修改:
    // 从 <main> 容器中获取所有 .website-group 和 .docker-group 元素。
    // 将所有 group 元素合并到一个数组 allGroups 中。
    // 按照 DOM 顺序对 allGroups 数组进行排序。
    // 根据排序后的 allGroups 数组， 分别构建 orderedWebsiteGroups 和 orderedDockerGroups 数组。
    // 分别调用 reorderWebsiteGroups 和 reorderDockerGroups API 进行保存
    try {
        // 获取所有 group 元素 (website-group 和 docker-group)
        const allGroups = Array.from(mainDashboard.querySelectorAll('.website-group, .docker-group'));

        // 按照 DOM 顺序排序 group 元素
        allGroups.sort((a, b) => {
            const indexA = Array.from(mainDashboard.children).indexOf(a);
            const indexB = Array.from(mainDashboard.children).indexOf(b);
            return indexA - indexB;
        });

        // 分别构建 website group 和 docker group 的排序数据
        const orderedWebsiteGroups = [];
        const orderedDockerGroups = [];
        allGroups.forEach((group, index) => {
            if (group.classList.contains('website-group')) {
                orderedWebsiteGroups.push({ id: group.id.replace('website-group-', ''), order: index + 1 });
            } else if (group.classList.contains('docker-group')) {
                orderedDockerGroups.push({ id: group.id.replace('docker-group-', ''), order: index + 1 });
            }
        });

        console.log('orderedWebsiteGroups:', orderedWebsiteGroups);
        const websiteUpdateResponse = await reorderWebsiteGroups(orderedWebsiteGroups);
        if (!websiteUpdateResponse) {
            throw new Error('Failed to update website group order');
        }

        console.log('orderedDockerGroups:', orderedDockerGroups);
        const dockerUpdateResponse = await reorderDockerGroups(orderedDockerGroups); // 调用 docker group 排序 API
        if (!dockerUpdateResponse) {
            throw new Error('Failed to update docker group order');
        }

        // 成功提示
        showNotification('分组顺序已保存', 'success');

        // 重新渲染dashboard
        // await renderDashboardWithData();

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
