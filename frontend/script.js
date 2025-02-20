'use strict';

import { SELECTORS, elements, initializeDOMElements } from './modules/eventDomManager.js';
import {
    handleWebsiteItemClick,
    handleDockerItemClick,
    handleQuicklyAddClick,
    handleHoverEvents
} from './modules/eventHandlers.js';
import { debounce, throttle, safeExecute, logEvent } from './modules/utils.js';
import { showTooltip, hideTooltip } from './modules/utils.js';
import { toggleRandomColors, loadColorPreference } from './modules/h2colorThemeService.js';
import { initThemeToggle, applySavedTheme } from './modules/themeService.js';
import { initLayoutToggle, applySavedLayout } from './modules/layoutService.js';
import { renderDashboardWithData } from './modules/mainDashboardService.js';
import { dockerUpdateInfoAll } from './modules/dockerIfonUpdate.js';
import { SearchService } from './modules/searchService.js';

import { isRandomColorsEnabled,setRandomGroupColors,resetGroupColors } from './modules/h2colorThemeService.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化 DOM 元素
    initializeDOMElements();

    // 初始化仪表盘和 Docker 容器数据渲染
    await Promise.all([
        renderDashboardWithData(),
        // renderDockerDashboardWithData()
    ]);

    // 实时刷新容器信息
    setInterval(dockerUpdateInfoAll, 1800000);
    // 功能按钮显示总开关
    elements.actionsToggleButton.addEventListener('click', toggleActionButtons);
    // 初始化搜索功能
    const searchService = new SearchService();

    // 应用保存的主题、布局和颜色偏好
    applySavedTheme();
    applySavedLayout();
    loadColorPreference();

    // h2随机色
    elements.groupColorToggleButton.classList.toggle('active', loadColorPreference());
    elements.groupColorToggleButton.addEventListener('click', async () => {
        const enabled = toggleRandomColors();
        elements.groupColorToggleButton.classList.toggle('active', enabled);
        if (isRandomColorsEnabled()) {
            setRandomGroupColors();
        } else {
            resetGroupColors();
        }
    });

    // 初始化主题和布局切换功能
    initThemeToggle();
    initLayoutToggle();

    // 添加鼠标悬停事件监听器
    elements.main.addEventListener('mouseover', handleHoverEvents);//websiteitem,dockeritem悬停菜单显示
    elements.actionsToggleButton.addEventListener('mouseover', showTooltip);//总开关按钮功能提示
    elements.actionButtons.querySelectorAll('.icon-button').forEach(button => {
        button.addEventListener('mouseover', showTooltip);//每个action按钮功能提示
    });

    // 绑定点击事件监听器
    elements.main.addEventListener('click', (event) => {
        handleQuicklyAddClick(event);  // 处理快速添加按钮点击
        handleWebsiteItemClick(event); // 处理网站项点击
        handleDockerItemClick(event);  // 处理 Docker 项点击
    });

    // 防抖处理鼠标移出事件
    document.addEventListener('mouseout', debounce(hideTooltip, 1000));

    // 动态加载模块：数据导入导出
    elements.importConfigButton.addEventListener('click', async () => {
        const { importData } = await import('./modules/historyDataService.js');
        safeExecute(importData, 'Failed to import data');
    });

    elements.exportConfigButton.addEventListener('click', async () => {
        const { exportData } = await import('./modules/historyDataService.js');
        safeExecute(exportData, 'Failed to export data');
    });
    // 日志记录
    //添加网站
    elements.addWebsiteButton.addEventListener('click', async () => {
        const { addWebsite } = await import('./modules/websiteInteractionService.js');
        logEvent('Add Website Button Clicked');
        safeExecute(addWebsite, 'Failed to add website');
    });
    //添加docker
    elements.addDockerButton.addEventListener('click', async () => {
        const { addDocker } = await import('./modules/dockerInteractionService.js');
        logEvent('Add Docker Button Clicked');
        safeExecute(addDocker, 'Failed to add docker');
    });
    //添加分组
    elements.addGroupButton.addEventListener('click', async () => {
        const { addGroup } = await import('./modules/groupInteractionService.js');
        logEvent('Add Group Button Clicked');
        safeExecute(addGroup, 'Failed to add group');
    });
    //批量导入网站
    elements.importWebsitesBatchButton.addEventListener('click', async () => {
        const { openImportWebsitesModal, } = await import('./modules/websiteInteractionService.js');
        logEvent('Import Websites Button Clicked');
        safeExecute(openImportWebsitesModal, 'Failed to open import modal');
    });
});


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