import {
    
    getAllDockers,
    getDockerGroups,
    getRealdockerinfobyId,
} from './api.js';
// Function to update docker item stats
const updateDockerStats = async (dockerItem) => { // 接收 dockerItem 参数
    
    try {
        const dockerId = dockerItem.dataset.dockerId; // 从 dockerItem 中获取 dockerId
        if (!dockerId) {
            console.error('Docker ID is missing in docker-item');
            return; // 如果 dockerId 不存在，则直接返回
        }
        // 使用 dockerId 调用 getRealdockerinfobyId API
        const realTimeInfo = await getRealdockerinfobyId(dockerId);
        if (realTimeInfo) {
            // Update docker item elements with real-time info
            dockerItem.querySelector('.docker-item-cpu .docker-item-stats-value').textContent = `${realTimeInfo.cpuUsage}%`; // CPU 使用率
            dockerItem.querySelector('.docker-item-memory-receive .docker-item-stats-value').textContent = `${(realTimeInfo.memoryUsage / (1024 * 1024)).toFixed(2)} GB`; // 内存 使用量 (GB)
            dockerItem.querySelector('.docker-item-memory-send .docker-item-stats-value').textContent = `${(realTimeInfo.networkIO?.eth0?.tx_bytes / (1024 * 1024)).toFixed(2)} MB`; // 发送数据量 (MB)
            dockerItem.querySelector('.docker-status-indicator').style.backgroundColor = realTimeInfo.state === 'running' ? 'var(--color-success)' : 'var(--color-error)'; // 容器状态
        }
    } catch (error) {
        console.error('Failed to fetch real-time docker info:', error);
    }
};
