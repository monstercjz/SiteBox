import { cloudSync } from './api.js';
import { showNotification } from './utils.js';

/**
 * 处理云端同步按钮点击
 */
export async function handleCloudSync() {
    try {
        const result = await cloudSync();
        showNotification(result.message || '同步成功', 'success');
    } catch (error) {
        console.error('云端同步失败:', error);
        showNotification(error.message || '云端同步失败', 'error');
    }
}