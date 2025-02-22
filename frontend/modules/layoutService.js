// frontend/modules/layoutService.js
const body = document.body;

// 添加布局类型常量
const LAYOUTS = {
    DEFAULT: 'default',
    ALTERNATIVE: 'alternative' // 更新常量名
};

// 获取当前布局
function getCurrentLayout() {
    return body.getAttribute('data-layout') || LAYOUTS.DEFAULT;
}

// 设置布局
function setLayout(layout) {
    body.setAttribute('data-layout', layout);
    // 更新布局选项的激活状态 (if needed, implement UI for layout switching later)
    document.querySelectorAll('.layout-switcher__option').forEach(option => {
        option.classList.toggle('active', option.dataset.layout === layout);
    });
    try {
        localStorage.setItem('layout', layout);
    } catch (error) {
        console.warn('Failed to save layout to localStorage:', error);
    }
}

// 初始化布局切换功能
export function initLayoutToggle() {
    const layoutSwitcherToggle = document.getElementById('layout-switcher-toggle');
    const layoutSwitcherOptions = document.querySelector('.layout-switcher__options');

    // 切换布局选项的显示/隐藏
    layoutSwitcherToggle.addEventListener('click', () => {
        layoutSwitcherOptions.classList.toggle('show');
    });

    // 点击其他地方时隐藏布局选项
    document.addEventListener('click', (e) => {
        if (!layoutSwitcherToggle.contains(e.target) && !layoutSwitcherOptions.contains(e.target)) {
            layoutSwitcherOptions.classList.remove('show');
        }
    });

    // 为每个布局选项添加点击事件
    document.querySelectorAll('.layout-switcher__option').forEach(option => {
        option.addEventListener('click', () => {
            setLayout(option.dataset.layout);
            layoutSwitcherOptions.classList.remove('show');
        });
    });
}

// 应用保存的布局
export function applySavedLayout() {
    const savedLayout = localStorage.getItem('layout');
    if (savedLayout) {
        setLayout(savedLayout);
    }
}



// 全局变量：用于存储事件监听器的引用
let globalClickListener = null;

export function toggleLayoutButtonShow() {
    // 获取主题选项元素
    const layoutSwitcherOptions = document.querySelector('.layout-switcher__options');

    // 切换显示/隐藏状态
    layoutSwitcherOptions.classList.toggle('show');

    // 判断当前状态
    const isShowing = layoutSwitcherOptions.classList.contains('show');

    if (isShowing) {
        // 如果显示，添加全局点击监听器
        addGlobalClickListener();
    } else {
        // 如果隐藏，移除全局点击监听器
        removeGlobalClickListener();
    }
}

// 添加全局点击监听器
function addGlobalClickListener() {
    if (!globalClickListener) {
        console.log('添加全局点击监听器');
        globalClickListener = (e) => handleGlobalClick(e);
        document.body.addEventListener('click', globalClickListener);
    }
}

// 移除全局点击监听器
function removeGlobalClickListener() {
    if (globalClickListener) {
        console.log('移除全局点击监听器');
        document.body.removeEventListener('click', globalClickListener);
        globalClickListener = null;
    }
}

// 处理全局点击事件
function handleGlobalClick(e) {
    const layoutSwitcherToggle = document.getElementById('layout-switcher-toggle');
    const layoutSwitcherOptions = document.querySelector('.layout-switcher__options');
    console.log('全局点击事件处理');
    // 判断点击是否在主题选项或触发按钮之外
    if (
        !layoutSwitcherOptions.contains(e.target) &&
        !layoutSwitcherToggle.contains(e.target)
    ) {
        // 隐藏主题选项
        hideLayoutSwitcherOptions();
    }
}

// 隐藏主题选项
function hideLayoutSwitcherOptions() {
    const layoutSwitcherOptions = document.querySelector('.layout-switcher__options');
    if (layoutSwitcherOptions) {
        layoutSwitcherOptions.classList.remove('show');
        console.log('隐藏主题选项');
        removeGlobalClickListener(); // 确保移除监听器
    }
}
//批量事件委托响应事件
export function toggleLayout(event) {
    const button = event.target.closest('.layout-switcher__option');
    if (!button) return;

    const layout = button.dataset.layout;
    console.log(`切换到布局: ${layout}`);
    try {
        setLayout(layout); // 应用主题
    } catch (error) {
        console.error(`Failed to load layout module:`, error);
    }
}
// Export layout constants for potential use in UI components
export { LAYOUTS };