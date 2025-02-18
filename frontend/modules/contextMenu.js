import { editGroup, deleteGroup } from './groupInteractionService.js';
import { editWebsite, deleteWebsite } from './websiteInteractionService.js';
import { editDocker, deleteDocker } from './dockerInteractionService.js';
import {
    CONTEXT_MENU_ID,
    EDIT_GROUP_ITEM_CLASS,
    DELETE_GROUP_ITEM_CLASS,
    EDIT_WEBSITE_ITEM_CLASS,
    DELETE_WEBSITE_ITEM_CLASS,
    EDIT_DOCKER_ITEM_CLASS,
    DELETE_DOCKER_ITEM_CLASS,
    DATA_GROUP_ID,
    DATA_ITEM_ID,
    DATA_GROUP_TYPE,
    GROUP_TYPE_WEBSITE,
    GROUP_TYPE_DOCKER,
    MENU_TEXT_EDIT_GROUP,
    MENU_TEXT_DELETE_GROUP,
    MENU_TEXT_EDIT_WEBSITE,
    MENU_TEXT_DELETE_WEBSITE,
    MENU_TEXT_EDIT_DOCKER,
    MENU_TEXT_DELETE_DOCKER,
    EVENT_CONTEXTMENU,
    CLASS_WEBSITE_GROUP,
    CLASS_DOCKER_GROUP,
    CLASS_WEBSITE_ITEM,
    CLASS_DOCKER_ITEM,
    REGEX_WEBSITE_GROUP_ID,
    REGEX_DOCKER_GROUP_ID,
} from '../config.js';

// 定义全局变量存储定时器 ID
let contextMenuTimeout;

// 隐藏右键菜单
function hideContextMenu() {
    document.getElementById(CONTEXT_MENU_ID)?.remove();
    // 清除定时器
    if (contextMenuTimeout) {
        clearTimeout(contextMenuTimeout);
        contextMenuTimeout = null;
    }
}

// 创建右键菜单
function createContextMenu(e, menuItems) {
    const menu = document.createElement('div');
    menu.id = CONTEXT_MENU_ID;
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

    // 添加定时器，10秒后隐藏菜单
    contextMenuTimeout = setTimeout(() => {
        hideContextMenu();
    }, 10000); // 10秒

    // 用户与菜单交互时重置定时器
    const resetTimer = () => {
        if (contextMenuTimeout) {
            clearTimeout(contextMenuTimeout);
        }
        contextMenuTimeout = setTimeout(() => {
            hideContextMenu();
        }, 10000); // 重新设置 10 秒定时器
    };

    // 监听菜单上的鼠标移动事件
    menu.addEventListener('mousemove', resetTimer);

    // 监听文档点击事件以隐藏菜单
    document.addEventListener('click', hideContextMenu);

    return menu;
}

// 显示分组右键菜单
function showGroupContextMenu(e, groupId, groupType) {
    const menuItems = [
        `<div class="${EDIT_GROUP_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_GROUP_TYPE}="${groupType}">${MENU_TEXT_EDIT_GROUP}</div>`,
        `<div class="${DELETE_GROUP_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_GROUP_TYPE}="${groupType}">${MENU_TEXT_DELETE_GROUP}</div>`,
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector(`.${EDIT_GROUP_ITEM_CLASS}`).addEventListener('click', () => {
        editGroup(groupId, groupType);
    });
    menu.querySelector(`.${DELETE_GROUP_ITEM_CLASS}`).addEventListener('click', () => {
        deleteGroup(groupId, groupType);
    });
}

// 显示网站右键菜单
function showWebsiteContextMenu(e, groupId, websiteId) {
    const menuItems = [
        `<div class="${EDIT_WEBSITE_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_ITEM_ID}="${websiteId}">${MENU_TEXT_EDIT_WEBSITE}</div>`,
        `<div class="${DELETE_WEBSITE_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_ITEM_ID}="${websiteId}">${MENU_TEXT_DELETE_WEBSITE}</div>`,
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector(`.${EDIT_WEBSITE_ITEM_CLASS}`).addEventListener('click', () => {
        editWebsite(groupId, websiteId);
    });
    menu.querySelector(`.${DELETE_WEBSITE_ITEM_CLASS}`).addEventListener('click', () => {
        deleteWebsite(groupId, websiteId);
    });
}

// 显示 Docker 分组右键菜单
function showDockerGroupContextMenu(e, groupId, groupType) {
    const menuItems = [
        `<div class="${EDIT_GROUP_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_GROUP_TYPE}="${groupType}">${MENU_TEXT_EDIT_GROUP}</div>`,
        `<div class="${DELETE_GROUP_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_GROUP_TYPE}="${groupType}">${MENU_TEXT_DELETE_GROUP}</div>`,
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector(`.${EDIT_GROUP_ITEM_CLASS}`).addEventListener('click', () => {
        editGroup(groupId, groupType);
    });
    menu.querySelector(`.${DELETE_GROUP_ITEM_CLASS}`).addEventListener('click', () => {
        deleteGroup(groupId, groupType);
    });
}

// 显示 Docker Item 右键菜单
function showDockerItemContextMenu(e, groupId, dockerId) {
    const menuItems = [
        `<div class="${EDIT_DOCKER_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_ITEM_ID}="${dockerId}">${MENU_TEXT_EDIT_DOCKER}</div>`,
        `<div class="${DELETE_DOCKER_ITEM_CLASS}" ${DATA_GROUP_ID}="${groupId}" ${DATA_ITEM_ID}="${dockerId}">${MENU_TEXT_DELETE_DOCKER}</div>`,
    ];
    const menu = createContextMenu(e, menuItems);
    menu.querySelector(`.${EDIT_DOCKER_ITEM_CLASS}`).addEventListener('click', () => {
        editDocker(groupId, dockerId);
    });
    menu.querySelector(`.${DELETE_DOCKER_ITEM_CLASS}`).addEventListener('click', () => {
        deleteDocker(groupId, dockerId);
    });
}

const dashboard = document.body;
dashboard.addEventListener(EVENT_CONTEXTMENU, function (e) {
    const target = e.target;
    hideContextMenu();
    if (target.closest(`.${CLASS_WEBSITE_GROUP} h2`)) {
        e.preventDefault();
        const groupDiv = target.closest(`.${CLASS_WEBSITE_GROUP}`);
        const groupId = getGroupId(groupDiv);
        console.log('右键监听到的groupId:', groupId);
        if (groupId) {
            showGroupContextMenu(e, groupId, GROUP_TYPE_WEBSITE);
        }
    } else if (target.closest(`.${CLASS_WEBSITE_ITEM}`)) {
        e.preventDefault();
        const websiteItem = target.closest(`.${CLASS_WEBSITE_ITEM}`);
        const groupDiv = websiteItem.closest(`.${CLASS_WEBSITE_GROUP}`);
        const groupId = getGroupId(groupDiv);
        const websiteId = websiteItem.getAttribute(DATA_ITEM_ID);
        console.log('右键监听到的groupId:', groupId, '网站ID:', websiteId);
        if (groupId && websiteId) {
            showWebsiteContextMenu(e, groupId, websiteId);
        }
    } else if (target.closest(`.${CLASS_DOCKER_GROUP} h2`)) {
        e.preventDefault();
        const groupDiv = target.closest(`.${CLASS_DOCKER_GROUP}`);
        const groupId = getDockerGroupId(groupDiv);
        console.log('右键监听到的dockerGroupId:', groupId);
        if (groupId) {
            showDockerGroupContextMenu(e, groupId, GROUP_TYPE_DOCKER);
        }
    } else if (target.closest(`.${CLASS_DOCKER_ITEM}`)) {
        e.preventDefault();
        const dockerItem = target.closest(`.${CLASS_DOCKER_ITEM}`);
        const groupDiv = dockerItem.closest(`.${CLASS_DOCKER_GROUP}`);
        const groupId = getDockerGroupId(groupDiv);
        const dockerId = dockerItem.getAttribute(DATA_ITEM_ID);
        console.log('右键监听到的dockerGroupId:', groupId, 'dockerId:', dockerId);
        if (groupId && dockerId) {
            showDockerItemContextMenu(e, groupId, dockerId);
        }
    }
});

// 辅助函数：从 groupDiv 中提取 groupId
function getGroupId(groupDiv) {
    return (
        groupDiv.getAttribute('id') ||
        groupDiv.querySelector('h2')?.getAttribute('id')?.match(REGEX_WEBSITE_GROUP_ID)?.[1] ||
        groupDiv.getAttribute(DATA_GROUP_ID)
        // groupDiv.getAttribute('id')
    );
}

// 辅助函数：从 docker group Div 中提取 dockerGroupId
function getDockerGroupId(groupDiv) {
    return (
        //在group添加了id页面显示，可以直接调用了
        groupDiv.getAttribute('id') ||
        groupDiv.querySelector('h2')?.getAttribute('id')?.match(REGEX_DOCKER_GROUP_ID)?.[1] ||
        groupDiv.getAttribute(DATA_GROUP_ID)
    );
}

export {
    hideContextMenu,
    createContextMenu,
    showGroupContextMenu,
    showWebsiteContextMenu,
    showDockerGroupContextMenu,
    showDockerItemContextMenu,
};