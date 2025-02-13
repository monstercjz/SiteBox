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
function showGroupContextMenu(e, groupId, groupType) { // 添加 groupType 参数
    const menuItems = [
        `<div class="edit-group-item" data-group-id="${groupId}" data-group-type="${groupType}">编辑分组</div>`, // 传递 groupType
        `<div class="delete-group-item" data-group-id="${groupId}" data-group-type="${groupType}">删除分组</div>` // 传递 groupType
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector('.edit-group-item').addEventListener('click', () => {
        editGroup(groupId, groupType); // 传递 groupType
    });
    menu.querySelector('.delete-group-item').addEventListener('click', () => {
        deleteGroup(groupId, groupType); // 传递 groupType
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

// 显示 Docker 分组右键菜单
function showDockerGroupContextMenu(e, groupId, groupType) { // 添加 groupType 参数
    const menuItems = [
        `<div class="edit-docker-group-item" data-group-id="${groupId}" data-group-type="${groupType}">编辑分组</div>`, // 传递 groupType
        `<div class="delete-docker-group-item" data-group-id="${groupId}" data-group-type="${groupType}">删除分组</div>` // 传递 groupType
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector('.edit-docker-group-item').addEventListener('click', () => {
        editGroup(groupId, groupType); // 传递 groupType，这里复用 editGroup，后续可能需要修改
    });
    menu.querySelector('.delete-docker-group-item').addEventListener('click', () => {
        deleteGroup(groupId, groupType); // 传递 groupType，这里复用 deleteGroup，后续可能需要修改
    });
}


// 显示 Docker Item 右键菜单
import { editDocker, deleteDocker } from './dockerInteractionService.js'; // 导入 dockerInteractionService
function showDockerItemContextMenu(e, groupId, dockerId) {
    const menuItems = [
        `<div class="edit-docker-item" data-group-id="${groupId}" data-docker-id="${dockerId}">编辑 Docker</div>`,
        `<div class="delete-docker-item" data-group-id="${groupId}" data-docker-id="${dockerId}">删除 Docker</div>`
    ];
    const menu = createContextMenu(e, menuItems);
     menu.querySelector('.edit-docker-item').addEventListener('click', () => {
        console.log('编辑 Docker', dockerId);
        editDocker(dockerId); // 调用 editDocker
    });
    menu.querySelector('.delete-docker-item').addEventListener('click', () => {
        deleteDocker(dockerId); // 调用 deleteDocker
        console.log('删除 Docker', dockerId);
    });
}

const dashboard = document.body;

// 右键菜单事件监听器
dashboard.addEventListener('contextmenu', function (e) {
    const target = e.target;
    hideContextMenu();
    
    if (target.closest('.website-group h2')) {
        e.preventDefault();
        const groupDiv = target.closest('.website-group');
        const groupId = getGroupId(groupDiv);
        console.log('右键监听到的groupId:', groupId);
        if (groupId) {
            showGroupContextMenu(e, groupId, 'website-group'); // 传递 group 类型
        }
    } else if (target.closest('.website-item')) {
        e.preventDefault();
        const websiteItem = target.closest('.website-item');
        const groupDiv = websiteItem.closest('.website-group');
        const groupId = getGroupId(groupDiv);
        const websiteId = websiteItem.getAttribute('data-website-id');
        console.log('右键监听到的groupId:', groupId, '网站ID:', websiteId);
        if (groupId && websiteId) {
            showWebsiteContextMenu(e, groupId, websiteId, 'website-item'); // 传递 itemType
        }
    } else if (target.closest('.docker-group h2')) { // 新增 docker group 的处理
        e.preventDefault();
        const groupDiv = target.closest('.docker-group');
        // const groupId = getGroupId(groupDiv); //  groupId 需要修改为能获取 docker group 的 id
        const groupId = getDockerGroupId(groupDiv);
        console.log('右键监听到的dockerGroupId:', groupId);
        if (groupId) {
            showDockerGroupContextMenu(e, groupId, 'docker-group'); // 传递 group 类型
        }
    } else if (target.closest('.docker-item')) { // 新增 docker item 的处理
        e.preventDefault();
        const dockerItem = target.closest('.docker-item');
        const groupDiv = dockerItem.closest('.docker-group');
        // const groupId = getGroupId(groupDiv); // groupId 需要修改为能获取 docker group 的 id
        const groupId = getDockerGroupId(groupDiv);
        const dockerId = dockerItem.getAttribute('data-docker-id');
        console.log('右键监听到的dockerGroupId:', groupId, 'dockerId:', dockerId);
        if (groupId && dockerId) {
            showDockerItemContextMenu(e, groupId, dockerId);
        }
    }
});

// 辅助函数：从 groupDiv 中提取 groupId
function getGroupId(groupDiv) {
    return (
        groupDiv.querySelector('h2')?.getAttribute('id')?.match(/websiteGroupTitle-([0-9a-fA-F-]+)/)?.[1] ||
        groupDiv.getAttribute('data-group-id')
    );
}

// 辅助函数：从 docker group Div 中提取 dockerGroupId
function getDockerGroupId(groupDiv) {
    return (
        groupDiv.querySelector('h2')?.getAttribute('id')?.match(/dockerGroupTitle-([0-9a-fA-F-]+)/)?.[1] ||
        groupDiv.getAttribute('data-group-id')
    );
}

export { hideContextMenu, createContextMenu, showGroupContextMenu, showWebsiteContextMenu, showDockerGroupContextMenu, showDockerItemContextMenu };
