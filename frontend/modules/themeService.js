import { showNotification } from './dashboardDataService.js';
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

// 主题列表
const themeList = [
    'green-bean',
    'galaxy-white',
    'almond-yellow',
    'autumn-leaf-brown',
    'rouge-red',
    'sea-sky-blue',
    'lotus-purple',
    'aurora-gray',
    'grass-green',
    'computer-manager',
    'wps-eye-care',
    'eye-parchment'
];

// 已使用主题列表
let usedThemes = localStorage.getItem('usedThemes') ? JSON.parse(localStorage.getItem('usedThemes')) : [];

// 随机设置主题
function setRandomTheme() {
    let availableThemes = themeList.filter(theme => !usedThemes.includes(theme));

    if (availableThemes.length === 0) {
        // 所有主题都已使用过，重置已使用主题列表
        usedThemes = [];
        availableThemes = themeList;
    }

    // 随机选择一个主题
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomTheme = availableThemes[randomIndex];

    // 应用主题
    setTheme(randomTheme);
    showNotification(`主题切换到: ${randomTheme}`, 'success');

    // 更新已使用主题列表
    usedThemes.push(randomTheme);
    localStorage.setItem('usedThemes', JSON.stringify(usedThemes));
}

// 初始化主题切换功能
export function initThemeToggle() {
    const themeSwitcherToggle = document.getElementById('theme-switcher-toggle');
    const themeSwitcherOptions = document.querySelector('.theme-switcher__options');
    
    // 切换主题选项的显示/隐藏
    themeSwitcherToggle.addEventListener('click', () => {
        themeSwitcherOptions.classList.toggle('show');
    });
    
    // 获取随机主题按钮元素
    const randomThemeButton = document.getElementById('random-theme-button');
    // 添加随机主题按钮点击事件监听器
    randomThemeButton.addEventListener('click', () => {
        setRandomTheme();
        // themeSwitcherOptions.classList.remove('show'); // 切换主题后关闭主题选项面板 (如果需要)
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