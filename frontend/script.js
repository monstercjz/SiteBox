'use strict';

import { SELECTORS, elements, initializeDOMElements } from './modules/eventDomManager.js';
import { renderDashboardWithData } from './modules/mainDashboardService.js';
import { dockerUpdateInfoAll } from './modules/dockerIfonUpdate.js';
import { initGroupOrderService } from './modules/groupOrderService.js';
// import { restartDocker } from './modules/dockerInteractionService.js';

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
    // 绑定点击事件监听器
    elements.main.addEventListener('click', async (event) => {
        const { handleMainElementsClick } = await import('/modules/mainInteraction.js'); // 动态加载模块
        handleMainElementsClick(event);
    });
    // 绑定悬停事件监听器websiteitem,dockeritem悬停菜单显示
    document.addEventListener('mouseover', async (event) => {
        const { handleHoverEvents } = await import('/modules/mainInteraction.js'); // 动态加载模块
        handleHoverEvents(event);
    });
    /* 初始化右键事件监听 */
    // const dashboard = document.body; // 改为 body 级委托
    elements.main.addEventListener('contextmenu', async (event) => {
        console.log('contextmenu event fired');
        event.preventDefault();
        const { handleContextMenu } = await import('/modules/contextMenu.js'); // 动态加载模块
        handleContextMenu(event);

    });
    // 功能按钮显示总开关
    elements.actionsToggleButton.addEventListener('click', toggleActionButtons);

    // 绑定icon-buttons事件委托在父容器action-buttons
    elements.actionButtons.addEventListener('click', async (event) => {
        const { handleButtonClick } = await import('./modules/mainInteraction.js');
        handleButtonClick(event);
    });
    // // 绑定 icon-buttons事件委托在父容器action-buttons
    // elements.actionButtons.addEventListener('mouseover', async (event) => {
    //     const debouncedShowTooltip = debounce(showTooltip, 500);
    //     debouncedShowTooltip(event);
    // });
    // // 绑定 icon-buttons事件委托在父容器action-buttons
    // elements.actionButtons.addEventListener('mouseout', async (event) => {
    //     const debouncedHideTooltip = debounce(hideTooltip, 500);
    //     debouncedHideTooltip(event);
    // });
    // 绑定 theme-switcher__options 的事件委托
    elements.themeSwitcherOptionsButtonContainer.addEventListener('click', async (event) => {
        const { toggleTheme } = await import('/modules/themeService.js'); // 动态加载模块
        toggleTheme(event);
    });
    // 绑定 layout-switcher__options 的事件委托
    elements.layoutSwitcherOptionsButtonContainer.addEventListener('click', async (event) => {
        const { toggleLayout } = await import('/modules/layoutService.js'); // 动态加载模块
        toggleLayout(event);

    });
    // 点击搜索图标时立即响应
    elements.searchFormIcon.addEventListener('click', async () => {
        // 直接切换搜索框状态
        const { setupSearchIconClick } = await import('./modules/searchService.js');
        setupSearchIconClick();
    });
    // script.js

    // 获取箭头按钮
    const scrollUpBtn = document.getElementById('scrollUp');
    const scrollDownBtn = document.getElementById('scrollDown');
    const scrollButtons = document.querySelector('.scroll-buttons');

    // 监听页面滚动事件
    window.addEventListener('scroll', () => {
        // 当页面滚动超过一定距离时显示按钮
        if (window.scrollY > 200) {
            scrollButtons.classList.add('show');
        } else {
            scrollButtons.classList.remove('show');
        }
    });

    // 回到顶部
    scrollUpBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 滚动到底部
    scrollDownBtn.addEventListener('click', () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    });
    // 监听 edit-h1-button 点击事件，触发 openSiteNameModal
    const editH1Button = document.querySelector('.edit-h1-button');
    if (editH1Button) {
        editH1Button.addEventListener('click', async () => {
            const { editSiteName } = await import('./modules/editTitle.js');
            editSiteName();
        });
    }

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

