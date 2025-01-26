// 控制分组标题颜色方案的服务模块

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
