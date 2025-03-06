import { safeExecute, logEvent } from './utils.js';

// 定义icon-buttons动作映射表
const actionMap = {
    'add-group-button': { module: '/modules/groupInteractionService.js', func: 'addGroup', log: 'Add Group Button Clicked', error: 'Failed to add group' },
    'add-website-button': { module: '/modules/websiteInteractionService.js', func: 'addWebsite', log: 'Add Website Button Clicked', error: 'Failed to add website' },
    'add-docker-button': { module: '/modules/dockerInteractionService.js', func: 'addDocker', log: 'Add Docker Button Clicked', error: 'Failed to add docker' },
    'import-config-button': { module: '/modules/historyDataService.js', func: 'importData', log: 'Import Config Button Clicked', error: 'Failed to import data' },
    'export-config-button': { module: '/modules/historyDataService.js', func: 'exportData', log: 'Export Config Button Clicked', error: 'Failed to export data' },
    'random-theme-button': { module: '/modules/themeService.js', func: 'setRandomTheme', log: 'Random Theme Button Clicked', error: 'Failed to toggle theme' },
    'group-color-toggle': { module: '/modules/h2colorThemeService.js', func: 'RandomColors', log: 'Random Group Color Button Clicked', error: 'Failed to toggle random colors' },
    'background-toggle': { module: '/modules/randomBackGroundService.js', func: 'RandomBackground', log: 'Random Background Button Clicked', error: 'Failed to toggle background' },
    'theme-switcher-toggle': { module: '/modules/themeService.js', func: 'toggleThemeButtonShow', log: 'Theme Switcher Toggle Button Clicked', error: 'Failed to toggle theme' },
    'layout-switcher-toggle': { module: '/modules/layoutService.js', func: 'toggleLayoutButtonShow', log: 'Theme Switcher Toggle Button Clicked', error: 'Failed to toggle theme' },
    'import-websites-batch-button': { module: '/modules/websiteInteractionService.js', func: 'openImportWebsitesModal', log: 'Import Websites Button Clicked', error: 'Failed to open import modal' }
};
/**
 * 通用事件处理函数
 * @param {Event} event - 触发的事件对象
 * @param {Object} actionMap - 动作映射表，定义按钮 ID 和对应的操作配置
 */
export async function handleButtonClick(event) {
    const button = event.target.closest('.icon-button');
    if (!button) return;

    const action = button.id;
    const config = actionMap[action];
    if (config) {
        try {
            const module = await import(config.module);
            if (module[config.func]) {
                logEvent(config.log);
                safeExecute(module[config.func], config.error);
            } else {
                console.error(`Function ${config.func} not found in module ${config.module}`);
            }
        } catch (error) {
            console.error(`Failed to load module ${config.module}:`, error);
        }
    }
}
// 主点击处理器配置（策略模式）
const MAIN_LEFT_CLICK_HANDLERS = [
    {
        // 快速添加按钮点击事件
        selector: '.quickly-item-add-button',
        handler: async (e, addIcon) => {
            const groupElement = addIcon.closest('.website-group, .docker-group');
            if (!groupElement) return;

            const groupType = groupElement.getAttribute('groupType');
            const groupId = groupElement.getAttribute('id');

            if (groupType === 'website-group') {
                const { addWebsite } = await import('./websiteInteractionService.js');
                addWebsite(groupId);
            } else if (groupType === 'docker-group') {
                const { addDocker } = await import('./dockerInteractionService.js');
                addDocker(groupId);
            } else {
                console.warn('Unknown group type:', groupType);
            }
        }
    },
    {
        // 网站项点击事件
        selector: '.website-item',
        handler: async (e, websiteTarget) => {
            const link = websiteTarget.querySelector('a');
            if (!link) return;

            const { handleWebsiteClick } = await import('./websiteInteractionService.js');
            handleWebsiteClick(websiteTarget);
            window.open(link.href, '_blank');
        }
    },
    {
        // Docker 项点击事件
        selector: '.docker-item',
        handler: (e, dockerTarget) => {
            const link = dockerTarget.querySelector('a');
            if (!link) {
                console.warn('No <a> element found within the clicked .docker-item');
                return;
            }

            window.open(link.href, '_blank');
        }
    }
];
/**
 * 统一处理主区域点击事件
 */
export async function handleMainElementsClick(e) {
    // 遍历所有处理器，匹配首个符合条件的目标元素
    for (const { selector, handler } of MAIN_LEFT_CLICK_HANDLERS) {
        const matchedElement = e.target.closest(selector);
        if (matchedElement) {
            handler(e, matchedElement); // 调用处理器并传递匹配的元素
            break; // 匹配成功后终止循环
        }
    }
}
// 合并鼠标悬停事件处理逻辑，item详细信息显示
// 鼠标悬停事件处理器配置
const HOVER_EVENT_HANDLERS = [
    {
        selector: '.website-item',
        handler: async (e, target) => {
            // const { handleWebsiteHover } = await import('./websiteInteractionService.js');
            // handleWebsiteHover(target);
        }
    },
    {
        selector: '.docker-item',
        handler: async (e, target) => {
            // const { handleDockerHover } = await import('./dockerInteractionService.js');
            // handleDockerHover(target);
        }
    }
];
/**
 * 统一处理鼠标悬停事件
 */
export async function handleHoverEventss(e) {
    for (const { selector, handler } of HOVER_EVENT_HANDLERS) {
        const matchedElement = e.target.closest(selector);
        if (matchedElement) {
            await handler(e, matchedElement); // 调用处理器并传递匹配的元素
            break; // 匹配成功后终止循环
        }
    }
}
export async function handleHoverEvents(e) {
    
    const { handleElementEnter } = await import('./tooltipService.js');
        handleElementEnter(e);
}