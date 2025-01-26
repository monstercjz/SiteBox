import { editGroup, deleteGroup } from './groupInteractionService.js';
import { editWebsite, deleteWebsite } from './websiteInteractionService.js';
// 隐藏右键菜单
function hideContextMenu() {
    document.getElementById('contextMenu')?.remove();
}

// 创建右键菜单
function createContextMenu(e, menuItems) {
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.style.position = 'fixed';
    
    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 直接使用鼠标位置
    let left = e.clientX;
    let top = e.clientY;
    
    // 确保菜单不会超出屏幕边界
    if (left + 200 > viewportWidth) {
        left = viewportWidth - 200;
    }
    if (top + 100 > viewportHeight) {
        top = viewportHeight - 100;
    }
    
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.zIndex = '1000';
    menu.innerHTML = menuItems.join('');
    document.body.appendChild(menu);
    document.addEventListener('click', hideContextMenu);
    return menu;
}


// 显示分组右键菜单
function showGroupContextMenu(e, groupId) {
    const menuItems = [
        `<div class="edit-group-item" data-group-id="${groupId}">编辑分组</div>`,
        `<div class="delete-group-item" data-group-id="${groupId}">删除分组</div>`
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector('.edit-group-item').addEventListener('click', () => {
        editGroup(groupId);
    });
    menu.querySelector('.delete-group-item').addEventListener('click', () => {
        deleteGroup(groupId);
    });
}
// 显示网站右键菜单
function showWebsiteContextMenu(e, groupId, websiteId) {
    const menuItems = [
        `<div class="edit-website-item" data-group-id="${groupId}" data-website-id="${websiteId}">编辑网站</div>`,
        `<div class="delete-website-item" data-group-id="${groupId}" data-website-id="${websiteId}">删除网站</div>`
    ];
    const menu = createContextMenu(e, menuItems);
     menu.querySelector('.edit-website-item').addEventListener('click', () => {
        console.log('编辑网站', websiteId);
        editWebsite(groupId, websiteId);
    });
    menu.querySelector('.delete-website-item').addEventListener('click', () => {
        deleteWebsite(groupId, websiteId);
    });
}

const dashboard = document.getElementById('dashboard');

// 右键菜单事件监听器
dashboard.addEventListener('contextmenu', function (e) {
    const target = e.target;
    hideContextMenu();
    
    if (target.closest('.group h2')) {
        e.preventDefault();
        const groupDiv = target.closest('.group');
        const groupId = getGroupId(groupDiv);
        console.log('右键监听到的groupId:', groupId);
        if (groupId) {
            showGroupContextMenu(e, groupId);
        }
    } else if (target.closest('.website-item')) {
        e.preventDefault();
        const websiteItem = target.closest('.website-item');
        const groupDiv = websiteItem.closest('.group');
        const groupId = getGroupId(groupDiv);
        const websiteId = websiteItem.getAttribute('data-website-id');
        console.log('右键监听到的groupId:', groupId, '网站ID:', websiteId);
        if (groupId && websiteId) {
            showWebsiteContextMenu(e, groupId, websiteId);
        }
    }
});

// 辅助函数：从 groupDiv 中提取 groupId
function getGroupId(groupDiv) {
    return (
        groupDiv.querySelector('h2')?.getAttribute('id')?.match(/editGroupName-([0-9a-fA-F-]+)/)?.[1] ||
        groupDiv.querySelector('h2 input[id^="editGroupName-"]')?.getAttribute('id')?.match(/editGroupName-([0-9a-fA-F-]+)/)?.[1] ||
        groupDiv.getAttribute('data-group-id')
    );
}

export { hideContextMenu, createContextMenu, showGroupContextMenu, showWebsiteContextMenu };
