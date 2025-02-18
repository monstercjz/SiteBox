import { showNotification } from './websiteDashboardService.js';
import {
    NOTIFICATION_THEME_CHANGED,
    DATA_ATTRIBUTE_THEME,
    DATA_ATTRIBUTE_THEME_OPTION,
    CLASS_THEME_SWITCHER_OPTION,
    CLASS_ACTIVE,
    CLASS_SHOW,
    LOCAL_STORAGE_KEY_THEME,
    LOCAL_STORAGE_KEY_USED_THEMES,
    SELECTOR_THEME_SWITCHER_TOGGLE,
    SELECTOR_THEME_SWITCHER_OPTIONS,
    SELECTOR_RANDOM_THEME_BUTTON,
    ERROR_SAVE_THEME_TO_LOCAL_STORAGE,
    THEME_LIST, // 从 config.js 导入主题列表
} from '../config.js';

const body = document.body;

// 添加主题类型常量
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    EYE_CARE: 'eye-care',
};

// 获取当前主题
function getCurrentTheme() {
    return body.getAttribute(DATA_ATTRIBUTE_THEME) || THEMES.LIGHT;
}

// 设置主题
function setTheme(theme) {
    body.setAttribute(DATA_ATTRIBUTE_THEME, theme);

    // 更新主题选项的激活状态
    document.querySelectorAll(`.${CLASS_THEME_SWITCHER_OPTION}`).forEach(option => {
        option.classList.toggle(CLASS_ACTIVE, option.dataset[DATA_ATTRIBUTE_THEME_OPTION] === theme);
        showNotification(`${NOTIFICATION_THEME_CHANGED}${theme}`, 'success');
    });

    try {
        localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
    } catch (error) {
        console.warn(ERROR_SAVE_THEME_TO_LOCAL_STORAGE, error);
    }
}



// 已使用主题列表
let usedThemes = localStorage.getItem(LOCAL_STORAGE_KEY_USED_THEMES)
    ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USED_THEMES))
    : [];

// 随机设置主题
function setRandomTheme() {
    let availableThemes = THEME_LIST.filter(theme => !usedThemes.includes(theme));
    if (availableThemes.length === 0) {
        // 所有主题都已使用过，重置已使用主题列表
        usedThemes = [];
        availableThemes = THEME_LIST;
    }

    // 随机选择一个主题
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    const randomTheme = availableThemes[randomIndex];

    // 应用主题
    setTheme(randomTheme);

    // 更新已使用主题列表
    usedThemes.push(randomTheme);
    localStorage.setItem(LOCAL_STORAGE_KEY_USED_THEMES, JSON.stringify(usedThemes));
}

// 初始化主题切换功能
export function initThemeToggle() {
    const themeSwitcherToggle = document.querySelector(SELECTOR_THEME_SWITCHER_TOGGLE);
    const themeSwitcherOptions = document.querySelector(SELECTOR_THEME_SWITCHER_OPTIONS);

    // 切换主题选项的显示/隐藏
    themeSwitcherToggle.addEventListener('click', () => {
        themeSwitcherOptions.classList.toggle(CLASS_SHOW);
    });

    // 获取随机主题按钮元素
    const randomThemeButton = document.querySelector(SELECTOR_RANDOM_THEME_BUTTON);

    // 添加随机主题按钮点击事件监听器
    randomThemeButton.addEventListener('click', () => {
        setRandomTheme();
        // themeSwitcherOptions.classList.remove(CLASS_SHOW); // 切换主题后关闭主题选项面板 (如果需要)
    });

    // 点击其他地方时隐藏主题选项
    document.addEventListener('click', (e) => {
        if (
            !themeSwitcherToggle.contains(e.target) &&
            !themeSwitcherOptions.contains(e.target)
        ) {
            themeSwitcherOptions.classList.remove(CLASS_SHOW);
        }
    });

    // 为每个主题选项添加点击事件
    document.querySelectorAll(`.${CLASS_THEME_SWITCHER_OPTION}`).forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset[DATA_ATTRIBUTE_THEME_OPTION]);
            themeSwitcherOptions.classList.remove(CLASS_SHOW);
        });
    });

    // 应用保存的主题
    applySavedTheme();
}

// 应用保存的主题
export function applySavedTheme() {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (savedTheme) {
        setTheme(savedTheme);
    }
}