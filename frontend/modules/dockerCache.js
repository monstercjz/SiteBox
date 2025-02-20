// dockerCache.js

const dockerItemCache = new WeakMap();
const idToItemMap = new Map(); // 辅助数据结构，用于存储 ID 到 DOM 元素的映射

/**
 * 初始化缓存
 * @param {NodeList} dockerItems - 所有 Docker 项的 DOM 元素列表
 */
export function initializeDockerItemCache(dockerItems) {
    dockerItems.forEach(item => {
        const dockerItemId = item.getAttribute('data-item-id');
        if (dockerItemId && !dockerItemCache.has(item)) {
            dockerItemCache.set(item, dockerItemId);
            idToItemMap.set(dockerItemId, item); // 更新辅助映射
        }
    });

    // 调试日志：打印已缓存的 Docker 项
    logCachedDockerItems();
}

/**
 * 动态更新缓存
 * @param {HTMLElement} dockerItem - 新增或修改的 Docker 项
 */
export function updateDockerItemCache(dockerItem) {
    const dockerItemId = dockerItem.getAttribute('data-item-id');

    if (dockerItemId && !dockerItemCache.has(dockerItem)) {
        dockerItemCache.set(dockerItem, dockerItemId);
        idToItemMap.set(dockerItemId, dockerItem); // 更新辅助映射
    }

    // 调试日志：打印已缓存的 Docker 项
    logCachedDockerItems();
}
/**
 * 从缓存中移除 Docker 项
 * @param {string} dockerItemId - Docker 项的 ID
 */
export function removeDockerItemFromCache(dockerItemId) {
    const item = idToItemMap.get(dockerItemId);
    if (item) {
        dockerItemCache.delete(item); // 从主缓存中移除
        idToItemMap.delete(dockerItemId); // 从辅助映射中移除
    }
}
/**
 * 获取缓存中的 Docker 项
 * @param {string} dockerItemId - Docker 项的 ID
 * @returns {HTMLElement | null} - 对应的 DOM 元素
 */
export function getDockerItemFromCache(dockerItemId) {
    return idToItemMap.get(dockerItemId) || null; // 直接从辅助映射中获取
}

/**
 * 清空缓存
 */
export function clearDockerItemCache() {
    dockerItemCache.clear();
    idToItemMap.clear();

    // 调试日志：打印清空后的缓存状态
    console.log('Docker item cache cleared.');
}

/**
 * 打印已缓存的 Docker 项
 */
function logCachedDockerItems() {
    console.groupCollapsed('Cached Docker Items:');
    for (let [id, item] of idToItemMap.entries()) {
        console.log(`ID: ${id}, Description: ${item.getAttribute('data-description')}`);
    }
    console.groupEnd();
}