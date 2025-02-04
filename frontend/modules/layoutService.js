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

// Export layout constants for potential use in UI components
export { LAYOUTS };