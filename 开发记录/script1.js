'use strict';

import { showNotification } from '../frontend/modules/websiteDashboardService.js';
import { renderDashboardWithData } from '../frontend/modules/mainDashboardService.js';
import { addDocker, handleDockerHover } from '../frontend/modules/dockerInteractionService.js';
import { SearchService } from '../frontend/modules/searchService.js';
import { fetchAndRenderGroupSelect, renderGroupSelect } from '../frontend/modules/groupSelectDataService.js';
import { applySavedTheme, initThemeToggle } from '../frontend/modules/themeService.js';
import { applySavedLayout, initLayoutToggle } from '../frontend/modules/layoutService.js';
import { loadColorPreference, toggleRandomColors } from '../frontend/modules/colorThemeService.js';
import { addGroup, deleteGroup, editGroup } from '../frontend/modules/groupInteractionService.js';
import { 
    addWebsite, 
    deleteWebsite, 
    getWebsiteInfo, 
    handleWebsiteHover, 
    openImportWebsitesModal,
    handleWebsiteClick 
} from '../frontend/modules/websiteInteractionService.js';
import { hideContextMenu, createContextMenu, showGroupContextMenu, showWebsiteContextMenu } from '../frontend/modules/contextMenu.js';
import { validateAndCompleteUrl, showTooltip, hideTooltip } from '../frontend/modules/utils.js';
import modalInteractionService from '../frontend/modules/modalInteractionService.js';
import '../frontend/modules/groupOrderService.js';
import { importData, exportData } from '../frontend/modules/historyDataService.js';
import { dockerUpdateInfoAll } from '../frontend/modules/dockerIfonUpdate.js';

let groupsData = null;

// 定义全局变量 elements
const elements = {};

document.addEventListener('DOMContentLoaded', async () => {
    const SELECTORS = {
        groupSelect: '#groupSelect',
        websitedashboard: '#websitedashboard',
        main: 'main',
        dockerdashboard: '#dockerdashboard',
        importConfigButton: '#import-config-button',
        exportConfigButton: '#export-config-button',
        importWebsitesBatchButton: '#import-websites-batch-button',
        actionsToggleButton: '#actions-toggle-button',
        actionButtons: '.action-buttons',
        addGroupButton: '#add-group-button',
        addWebsiteButton: '#add-website-button',
        addDockerButton: '#add-docker-button',
        groupColorToggleButton: '#group-color-toggle'
    };

    // 初始化 DOM 元素
    for (const [key, selector] of Object.entries(SELECTORS)) {
        elements[key] = document.querySelector(selector);
    }

    // 初始化仪表盘和 Docker 容器数据渲染
    await Promise.all([
        renderDashboardWithData(),
        // renderDockerDashboardWithData()
    ]);

    // 实时刷新容器信息
    setInterval(dockerUpdateInfoAll, 300000);

    // 初始化搜索功能
    const searchService = new SearchService();

    // 应用保存的主题、布局和颜色偏好
    applySavedTheme();
    applySavedLayout();
    loadColorPreference();

    // 设置颜色切换按钮的初始状态
    elements.groupColorToggleButton.classList.toggle('active', loadColorPreference());
    elements.groupColorToggleButton.addEventListener('click', async () => {
        const enabled = toggleRandomColors();
        elements.groupColorToggleButton.classList.toggle('active', enabled);
        await renderDashboardWithData(); // 重新渲染以应用新的颜色设置
    });

    // 初始化主题和布局切换功能
    initThemeToggle();
    initLayoutToggle();

    // 添加鼠标悬停事件监听器
    elements.main.addEventListener('mouseover', handleHoverEvents);
    elements.actionsToggleButton.addEventListener('mouseover', showTooltip);
    elements.actionButtons.querySelectorAll('.icon-button').forEach(button => {
        button.addEventListener('mouseover', showTooltip);
    });

    // 添加切换添加按钮点击事件监听器
    elements.actionsToggleButton.addEventListener('click', toggleActionButtons);

    // 添加数据导入导出按钮点击事件监听器
    elements.importConfigButton.addEventListener('click', importData);
    elements.exportConfigButton.addEventListener('click', exportData);

    // 添加导入网站按钮点击事件监听器
    elements.importWebsitesBatchButton.addEventListener('click', openImportWebsitesModal);

    // 添加分组、网站、Docker 容器按钮点击事件监听器
    elements.addGroupButton.addEventListener('click', addGroup);
    elements.addWebsiteButton.addEventListener('click', addWebsite);
    elements.addDockerButton.addEventListener('click', addDocker);

    // 处理仪表盘点击事件
    elements.main.addEventListener('click', handleMainClicks);

    // 鼠标移开事件监听器，隐藏工具提示
    document.addEventListener('mouseout', hideTooltip);
});

// 合并鼠标悬停事件处理逻辑
function handleHoverEvents(e) {
    const websiteTarget = e.target.closest('.website-item');
    if (websiteTarget) {
        handleWebsiteHover(websiteTarget);
        return;
    }

    const dockerTarget = e.target.closest('.docker-item');
    if (dockerTarget) {
        handleDockerHover(dockerTarget);
    }
}

// 切换添加按钮的显示状态
function toggleActionButtons() {
    const buttons = elements.actionButtons.querySelectorAll('.icon-button');
    const isShowing = elements.actionButtons.classList.toggle('show');

    buttons.forEach((btn, index) => {
        btn.style.transitionDelay = `${isShowing ? 50 * index : 50 * (buttons.length - index - 1)}ms`;
    });

    setTimeout(() => {
        buttons.forEach(btn => btn.style.transitionDelay = '');
    }, 300);
}

// 处理仪表盘点击事件
function handleMainClicks(e) {
    // 处理分组加号图标点击事件
    const addIcon = e.target.closest('.quickly-item-add-button');
    if (addIcon) {
        const groupElement = addIcon.closest('.website-group, .docker-group');
        if (groupElement) {
            const groupType = groupElement.getAttribute('groupType');
            const groupId = groupElement.getAttribute('id');
            if (groupType === 'website-group') {
                addWebsite(groupId);
            } else if (groupType === 'docker-group') {
                addDocker(groupId);
            } else {
                console.warn('Unknown group type:', groupType);
            }
        }
        return;
    }

    // 处理网站链接点击事件
    const websiteTarget = e.target.closest('.website-item');
    if (websiteTarget) {
        const link = websiteTarget.querySelector('a');
        if (link) {
            handleWebsiteClick(websiteTarget);
            window.open(link.href, '_blank');
        }
        return;
    }

    // 处理 Docker 容器链接点击事件
    const dockerTarget = e.target.closest('.docker-item');
    if (dockerTarget) {
        const link = dockerTarget.querySelector('a');
        if (link) {
            window.open(link.href, '_blank');
        } else {
            console.warn('No <a> element found within the clicked .docker-item');
        }
    }
}