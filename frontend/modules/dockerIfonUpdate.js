import {
    
    getAllDockers,
    getDockerGroups,
    getRealdockerinfobyId,
    getRealdockerinfo
} from './api.js';
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

// Function to update all docker items' real-time info
const dockerUpdateInfoAll = async () => {
    try {
        const realTimeInfoList = await getAllDockersRealTimeInfo();
        if (realTimeInfoList && realTimeInfoList.length > 0) {
            realTimeInfoList.forEach(realTimeInfo => {
                const dockerItemId = realTimeInfo.dockerItemId;
                const dockerItem = document.querySelector(`.docker-item[data-docker-id='${dockerItemId}']`);
                if (dockerItem) {
                    dockerItem.querySelector('.docker-item-cpu .docker-item-stats-value').textContent = `${realTimeInfo.cpuUsage}%`; // CPU 使用率
                    dockerItem.querySelector('.docker-item-networkIo-receive .docker-item-stats-value').textContent = `${(realTimeInfo.networkIO?.eth0?.rx_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // 接收数据量 (GB)
                    dockerItem.querySelector('.docker-item-networkIo-send .docker-item-stats-value').textContent = `${(realTimeInfo.networkIO?.eth0?.tx_bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // 发送数据量 (GB)
                    dockerItem.querySelector('.docker-status-indicator').style.backgroundColor = realTimeInfo.state === 'running' ? 'var(--color-running)' : 'var(--color-stop)'; // 容器状态
                }
            });
        }
    } catch (error) {
        console.error('Failed to fetch all real-time docker info:', error);
    }
};

async function getAllDockersRealTimeInfo() {
    try {
        return await getRealdockerinfo();
    } catch (error) {
        console.error('Error fetching real-time info for all dockers:', error);
        return null;
    }
}

export { dockerUpdateInfoAll };
