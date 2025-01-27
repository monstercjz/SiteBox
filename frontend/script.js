'use strict';

import { showNotification, renderDashboardWithData } from './modules/dashboardDataService.js';
//import { WebsiteDataService } from './modules/websiteDataService.js';
import { SearchService } from './modules/searchService.js';
import { fetchAndRenderGroupSelect, renderGroupSelect } from './modules/groupSelectDataService.js';
import { applySavedTheme, initThemeToggle } from './modules/themeService.js';
import { loadColorPreference, toggleRandomColors } from './modules/colorThemeService.js';
import { addGroup, deleteGroup, editGroup } from './modules/groupInteractionService.js';
import { addWebsite, deleteWebsite, getWebsiteInfo, handleWebsiteHover, openImportWebsitesModal ,handleWebsiteClick } from './modules/websiteInteractionService.js';
import { hideContextMenu, createContextMenu, showGroupContextMenu, showWebsiteContextMenu } from './modules/contextMenu.js';
import { validateAndCompleteUrl, showTooltip, hideTooltip } from './modules/utils.js';
import modalInteractionService from './modules/modalInteractionService.js';
import './modules/groupOrderService.js';
import { importData, exportData } from './modules/historyDataService.js';

// 用于存储分组数据
let groupsData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 获取分组选择下拉框元素
    const groupSelect = document.getElementById('groupSelect');
    // 获取仪表盘元素
    const dashboard = document.getElementById('dashboard');
    // 获取数据导入按钮元素
    const importConfigButton = document.getElementById('import-config-button');
    // 获取数据导出按钮元素
    const exportConfigButton = document.getElementById('export-config-button');
    // 获取导入网站按钮元素
    const importWebsitesBatchButton = document.getElementById('import-websites-batch-button');
    // 获取切换添加按钮元素
    const actionsToggleButton = document.getElementById('actions-toggle-button');
    // 获取添加按钮容器元素
    const actionButtons = document.querySelector('.action-buttons');

    // 应用保存的主题和颜色偏好
    applySavedTheme();
    loadColorPreference();

    // 设置颜色切换按钮的初始状态
    const groupColorToggleButton = document.getElementById('group-color-toggle');
    groupColorToggleButton.classList.toggle('active', loadColorPreference());

    // 渲染仪表盘数据
    await renderDashboardWithData();

    // 初始化搜索功能
    const searchService = new SearchService();

    // 添加颜色切换按钮点击事件监听器
    groupColorToggleButton.addEventListener('click', async () => {
        const enabled = toggleRandomColors();
        groupColorToggleButton.classList.toggle('active', enabled);
        await renderDashboardWithData(); // 重新渲染以应用新的颜色设置
    });

    /**
     * 处理仪表盘点击事件，打开网站链接
     * 使用事件委托，监听仪表盘容器的点击事件
     * @param {Event} e - 点击事件对象
     */
    dashboard.addEventListener('click', async (e) => {
        const target = e.target.closest('.website-item');
        if (target) {
            const link = target.querySelector('a');
            if (link) {
                // 记录点击时间
                await handleWebsiteClick(target);
                // 打开链接
                window.open(link.href, '_blank');
            }
        }
    });

    // 添加数据导入按钮点击事件监听器
    importConfigButton.addEventListener('click', importData);

    // 添加数据导出按钮点击事件监听器
    exportConfigButton.addEventListener('click', exportData);

    // 添加导入网站按钮点击事件监听器
    importWebsitesBatchButton.addEventListener('click', () => {
        openImportWebsitesModal();
    });

    // 添加鼠标悬停事件监听器
    dashboard.addEventListener('mouseover', (e) => {
        const target = e.target.closest('.website-item');
        if (target) {
            // 显示网站详细信息tooltip
            handleWebsiteHover(target);
        }
    });

    // 添加鼠标移开事件监听器，隐藏工具提示
    document.addEventListener('mouseout', hideTooltip);

    // 添加切换添加按钮点击事件监听器
    actionsToggleButton.addEventListener('click', () => {
        const buttons = actionButtons.querySelectorAll('.icon-button');
        if (actionButtons.classList.contains('show')) {
            actionButtons.classList.remove('show');
            // 关闭时反向设置延迟
            buttons.forEach((btn, index) => {
                btn.style.transitionDelay = `${50 * (buttons.length - index - 1)}ms`;
            });
        } else {
            actionButtons.classList.add('show');
            // 添加按钮显示动画效果
            buttons.forEach((btn, index) => {
                btn.style.transitionDelay = `${50 * index}ms`;
            });
        }

        // 300ms后重置所有transition-delay
        setTimeout(() => {
            buttons.forEach(btn => {
                btn.style.transitionDelay = '';
            });
        }, 300);
    });

    // 添加添加分组按钮点击事件监听器
    const addGroupButton = document.getElementById('add-group-button');
    addGroupButton.addEventListener('click', () => {
        addGroup();
    });

    // 添加添加网站按钮点击事件监听器
    const addWebsiteButton = document.getElementById('add-website-button');
    addWebsiteButton.addEventListener('click', () => {
        addWebsite();
    });

    // 初始化主题切换功能
    initThemeToggle();
});
