import { showNotification } from './utils.js';
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

// 动态加载 CSS 文件
function loadCSS(url) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}


// 设置主题
export function setTheme(theme) {
    const themeCSSURL = `styles/theme/${theme}-theme-colors.css`; // 构建主题 CSS 文件 URL

    // 移除旧的主题 CSS link 元素
    const oldThemeLinks = document.querySelectorAll('link[href*="styles/theme/"]');
    oldThemeLinks.forEach(link => link.remove());

    loadCSS(themeCSSURL)
        .then(() => {
            body.setAttribute(DATA_ATTRIBUTE_THEME, theme); // CSS 加载完成后设置 data-theme 属性 (可选)

            // 更新主题选项的激活状态
            document.querySelectorAll(`.${CLASS_THEME_SWITCHER_OPTION}`).forEach(option => {
                option.classList.toggle(CLASS_ACTIVE, option.dataset[DATA_ATTRIBUTE_THEME_OPTION] === theme);
            });
            showNotification(`${NOTIFICATION_THEME_CHANGED}${theme}`, 'success');

            try {
                localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
            } catch (error) {
                console.warn(ERROR_SAVE_THEME_TO_LOCAL_STORAGE, error);
            }
        })
        .catch(error => {
            console.error(`加载主题 CSS失败: ${theme}`, error);
            showNotification(`主题 ${theme} 加载失败`, 'error'); // 显示加载失败的通知
        });
}

// 已使用主题列表
let usedThemes = localStorage.getItem(LOCAL_STORAGE_KEY_USED_THEMES)
    ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_USED_THEMES))
    : [];

// 随机设置主题
export function setRandomTheme() {
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
    return () => {
        themeSwitcherToggle.removeEventListener('click', toggleOptions);
        randomThemeButton.removeEventListener('click', handleRandomThemeClick);
        document.removeEventListener('click', handleClickOutside);
        document.querySelectorAll(`.${CLASS_THEME_SWITCHER_OPTION}`).forEach(option => {
            option.removeEventListener('click', handleClickOption);
        });
    };
}


// 全局变量：用于存储事件监听器的引用
let globalClickListener = null;

export function toggleThemeButtonShow() {
    // 获取主题选项元素
    const themeSwitcherOptions = document.querySelector(SELECTOR_THEME_SWITCHER_OPTIONS);

    // 切换显示/隐藏状态
    themeSwitcherOptions.classList.toggle(CLASS_SHOW);

    // 判断当前状态
    const isShowing = themeSwitcherOptions.classList.contains(CLASS_SHOW);

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
    const themeSwitcherToggle = document.querySelector(SELECTOR_THEME_SWITCHER_TOGGLE);
    const themeSwitcherOptions = document.querySelector(SELECTOR_THEME_SWITCHER_OPTIONS);
    console.log('全局点击事件处理');
    // 判断点击是否在主题选项或触发按钮之外
    if (
        !themeSwitcherOptions.contains(e.target) &&
                !themeSwitcherToggle.contains(e.target)
    ) {
        // 隐藏主题选项
        hideThemeSwitcherOptions();
    }
}

// 隐藏主题选项
function hideThemeSwitcherOptions() {
    const themeSwitcherOptions = document.querySelector(SELECTOR_THEME_SWITCHER_OPTIONS);
    if (themeSwitcherOptions) {
        themeSwitcherOptions.classList.remove(CLASS_SHOW);
        console.log('隐藏主题选项');
        removeGlobalClickListener(); // 确保移除监听器
    }
}
//批量事件委托响应事件
export function toggleTheme(event) {
    const button = event.target.closest('.theme-switcher__option');
    if (!button) return;

    const theme = button.dataset.theme;
    console.log(`切换到主题: ${theme}`);
    try {
        setTheme(theme); // 应用主题
    } catch (error) {
        console.error(`Failed to load theme module:`, error);
    }
}
// 应用保存的主题
export function applySavedTheme() {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    if (savedTheme) {
        setTheme(savedTheme);
    }
}

export { THEMES };