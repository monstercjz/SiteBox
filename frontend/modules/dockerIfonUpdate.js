import {
    getRealdockerinfobyId,
    getRealdockerinfo
} from './api.js';
import {
    NOTIFICATION_ERROR,
} from '../config.js';
import { getDockerItemFromCache } from './dockerCache.js';
import { showNotification } from './utils.js';
// Function to update docker item stats单个docker的实时信息
const updateDockerStats = async () => {
    
    try {
        // Pass dockerData to getRealdockerinfobyId
        const realTimeInfo = await getRealdockerinfobyId(dockerid);
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

// dockerUpdate.js



/**
 * 更新单个 Docker 项的信息
 * @param {HTMLElement} dockerItem - Docker 项的 DOM 元素
 * @param {object} realTimeInfo - 实时信息对象
 */
function updateDockerItemInfo(dockerItem, realTimeInfo) {
    if (dockerItem._cpuValue) {
        dockerItem._cpuValue.textContent = `${realTimeInfo.cpuUsage}%`;
    }
    if (dockerItem._networkReceiveValue) {
        dockerItem._networkReceiveValue.textContent = `${(realTimeInfo.networkIO?.eth0?.rx_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (dockerItem._networkSendValue) {
        dockerItem._networkSendValue.textContent = `${(realTimeInfo.networkIO?.eth0?.tx_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (dockerItem._statusIndicator) {
        dockerItem._statusIndicator.style.backgroundColor = realTimeInfo.state === 'running' ? 'var(--color-running)' : 'var(--color-stop)';
    }
}

/**
 * 获取所有 Docker 容器的实时信息
 * @returns {Promise<Array>} - 返回包含所有 Docker 容器实时信息的数组
 */
async function getAllDockersRealTimeInfo() {
    try {
        return await getRealdockerinfo(); // 假设这是一个异步函数，返回实时信息
    } catch (error) {
        console.error('Error fetching real-time info for all dockers:', error);
        showNotification('无法获取 Docker 实时信息，请检查网络连接', NOTIFICATION_ERROR);
        return [];
    }
}

/**
 * 更新所有 Docker 项的实时信息
 */
let lastUpdateTime = 0; // 记录上一次更新的时间戳
const UPDATE_INTERVAL = 1 * 60 * 1000; // 5 分钟的时间间隔（单位：毫秒）

export async function dockerUpdateInfoAll() {
    const currentTime = Date.now();
    console.log('currentTime', currentTime);
    // 检查是否已经超过 5 分钟
    if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
        console.warn('Function call is too frequent. Please wait for the cooldown period.');
        return;
    }

    try {
        lastUpdateTime = currentTime; // 更新时间戳

        const realTimeInfoList = await getAllDockersRealTimeInfo();
        if (realTimeInfoList.length > 0) {
            requestAnimationFrame(() => {
                realTimeInfoList.forEach(realTimeInfo => {
                    const dockerItemId = realTimeInfo.dockerItemId;
                    const dockerItem = getDockerItemFromCache(dockerItemId);
                    if (dockerItem) {
                        updateDockerItemInfo(dockerItem, realTimeInfo);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Failed to fetch all real-time docker info:', error);
    }
}
// export async function dockerUpdateInfoAll() {
//     try {
//         const realTimeInfoList = await getAllDockersRealTimeInfo();
//         if (realTimeInfoList.length > 0) {
//             requestAnimationFrame(() => {
//                 realTimeInfoList.forEach(realTimeInfo => {
//                     const dockerItemId = realTimeInfo.dockerItemId;
//                     const dockerItem = getDockerItemFromCache(dockerItemId);
//                     if (dockerItem) {
//                         updateDockerItemInfo(dockerItem, realTimeInfo);
//                     }
//                 });
//             });
//         }
//     } catch (error) {
//         console.error('Failed to fetch all real-time docker info:', error);
//     }
// }