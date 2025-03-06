// 控制随机背景图片的服务模块
import { BACKGROUND_IMAGES } from "../config.js";
import { showNotification } from "./utils.js";

let useRandomBackground = false;

/**
 * 保存背景图片偏好设置
 * @param {boolean} enabled - 是否启用随机背景图片
 */
export function saveBackgroundPreference(enabled) {
    useRandomBackground = enabled;
    try {
        localStorage.setItem('useRandomBackground', JSON.stringify(enabled));
    } catch (error) {
        console.warn('Failed to save background preference to localStorage:', error);
    }
}

/**
 * 从 localStorage 加载背景图片偏好设置
 * @returns {boolean} - 是否启用随机背景图片
 */
export function loadBackgroundPreference() {
    try {
        const saved = localStorage.getItem('useRandomBackground');
        if (saved !== null) {
            useRandomBackground = JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Failed to load background preference from localStorage:', error);
    }
    return useRandomBackground;
}

/**
 * 检查是否启用随机背景图片
 * @returns {boolean}
 */
export function isRandomBackgroundEnabled() {
    return useRandomBackground;
}

/**
 * 切换随机背景图片设置
 * @returns {boolean} - 切换后的状态
 */
export function toggleRandomBackground() {
    useRandomBackground = !useRandomBackground;
    saveBackgroundPreference(useRandomBackground);
    return useRandomBackground;
}

/**
 * @function setRandomBackground
 * @description 设置随机背景图片
 */
/**
 * 从 localStorage 加载已使用背景图片索引
 * @returns {number[]} - 已使用索引数组
 */
function loadUsedBackgroundIndices() {
    try {
        const savedIndices = localStorage.getItem('usedBackgroundIndices');
        if (savedIndices !== null) {
            return JSON.parse(savedIndices);
        }
    } catch (error) {
        console.warn('Failed to load used background indices from localStorage:', error);
    }
    return [];
}

/**
 * 保存已使用背景图片索引到 localStorage
 * @param {number[]} indices - 已使用索引数组
 */
function saveUsedBackgroundIndices(indices) {
    try {
        localStorage.setItem('usedBackgroundIndices', JSON.stringify(indices));
    } catch (error) {
        console.warn('Failed to save used background indices to localStorage:', error);
    }
}


/**
 * @function setRandomBackground
 * @description 设置随机背景图片，确保不重复
 */
export function setRandomBackground() {
    let usedIndices = loadUsedBackgroundIndices(); // 加载已使用索引
    let availableIndices = Array.from({ length: BACKGROUND_IMAGES.length }, (_, index) => index); // 创建所有索引数组

    // 移除已使用过的索引
    usedIndices.forEach(index => {
        const usedIndexPos = availableIndices.indexOf(index);
        if (usedIndexPos > -1) {
            availableIndices.splice(usedIndexPos, 1);
        }
    });

    if (availableIndices.length === 0) {
        // 所有图片都用过了，重置已使用索引
        usedIndices = [];
        availableIndices = Array.from({ length: BACKGROUND_IMAGES.length }, (_, index) => index);
    }

    let randomIndexIndex = Math.floor(Math.random() * availableIndices.length);
    let randomIndex = availableIndices[randomIndexIndex];
    const randomBackgroundImage = BACKGROUND_IMAGES[randomIndex];
    document.body.style.backgroundImage = randomBackgroundImage;

    usedIndices.push(randomIndex); // 添加到已使用索引
    saveUsedBackgroundIndices(usedIndices); // 保存已使用索引
    showNotification('设置随机背景图片成功', 'success');
}

/**
 * @function resetBackground
 * @description 重置背景图片为默认值 (移除背景图片)
 */
export function resetBackground() {
    document.body.style.backgroundImage = ''; // 移除背景图片
    showNotification('已重置背景图片为默认值', 'success');
}


export function RandomBackground() {
    const enabled = toggleRandomBackground();
    const backgroundToggleButton = document.querySelector('#background-toggle');
    backgroundToggleButton.classList.toggle('active', enabled);
    if (isRandomBackgroundEnabled()) {
        setRandomBackground();
    } else {
        resetBackground();
    }
}