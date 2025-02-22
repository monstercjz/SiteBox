// 控制分组标题颜色方案的服务模块
import { RANDOM_COLORS } from "../config.js";
import { showNotification } from "./utils.js";
let useRandomColors = false;

/**
 * 保存颜色偏好设置
 * @param {boolean} enabled - 是否启用随机颜色
 */
export function saveColorPreference(enabled) {
    useRandomColors = enabled;
    try {
        localStorage.setItem('useRandomColors', JSON.stringify(enabled));
    } catch (error) {
        console.warn('Failed to save color preference to localStorage:', error);
    }
}

/**
 * 从 localStorage 加载颜色偏好设置
 * @returns {boolean} - 是否启用随机颜色
 */
export function loadColorPreference() {
    try {
        const saved = localStorage.getItem('useRandomColors');
        if (saved !== null) {
            useRandomColors = JSON.parse(saved);
        }
    } catch (error) {
        console.warn('Failed to load color preference from localStorage:', error);
    }
    return useRandomColors;
}

/**
 * 检查是否启用随机颜色
 * @returns {boolean}
 */
export function isRandomColorsEnabled() {
    return useRandomColors;
}

/**
 * 切换随机颜色设置
 * @returns {boolean} - 切换后的状态
 */
export function toggleRandomColors() {
    useRandomColors = !useRandomColors;
    saveColorPreference(useRandomColors);
    return useRandomColors;
}
/**
 * @function setRandomGroupColors
 * @description 为每个分组标题设置随机颜色
 */
export function setRandomGroupColors() {
  
    //从config.js导入RANDOM_COLORS
    const groupTitles = document.querySelectorAll('.website-group h2,.docker-group h2');
    groupTitles.forEach(title => {
      const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
      title.style.setProperty('--group-title-random-color', color);
    });
    showNotification('设置随机分组标题颜色成功', 'success');
  }
  
  /**
   * @function resetGroupColors
   * @description 重置所有分组标题的颜色为默认值
   */
export  function resetGroupColors() {
    const groupTitles = document.querySelectorAll('.website-group h2,.docker-group h2');
    groupTitles.forEach(title => {
      title.style.removeProperty('--group-title-random-color');
    });
    showNotification('已重置所有分组标题的颜色为默认值', 'success');
  }
export function RandomColors() {
    const enabled = toggleRandomColors();
    const groupColorToggleButton= document.querySelector('#group-color-toggle');
            groupColorToggleButton.classList.toggle('active', enabled);
            if (isRandomColorsEnabled()) {
                setRandomGroupColors();
            } else {
                resetGroupColors();
            }
    
}