const body = document.body;

// 添加主题类型常量
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    EYE_CARE: 'eye-care'
};

// 获取当前主题
function getCurrentTheme() {
    return body.getAttribute('data-theme') || THEMES.LIGHT;
}

// 设置主题
function setTheme(theme) {
    body.setAttribute('data-theme', theme);
    // 更新主题选项的激活状态
    document.querySelectorAll('.theme-switcher__option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    try {
        localStorage.setItem('theme', theme);
    } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
    }
}

// 初始化主题切换功能
export function initThemeToggle() {
    const themeSwitcherToggle = document.getElementById('theme-switcher-toggle');
    const themeSwitcherOptions = document.querySelector('.theme-switcher__options');
    
    // 切换主题选项的显示/隐藏
    themeSwitcherToggle.addEventListener('click', () => {
        themeSwitcherOptions.classList.toggle('show');
    });
    
    // 点击其他地方时隐藏主题选项
    document.addEventListener('click', (e) => {
        if (!themeSwitcherToggle.contains(e.target) && !themeSwitcherOptions.contains(e.target)) {
            themeSwitcherOptions.classList.remove('show');
        }
    });
    
    // 为每个主题选项添加点击事件
    document.querySelectorAll('.theme-switcher__option').forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
            themeSwitcherOptions.classList.remove('show');
        });
    });
    
    // 应用保存的主题
    applySavedTheme();
}

// 应用保存的主题
export function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
}