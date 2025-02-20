// 导入必要的 API 函数
import { getWebsiteGroups, getWebsites, getAllDockers, getDockerGroups } from './api.js';

/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 */
async function fetchMainDashboardData() {
    try {
        const websiteGroups = await getWebsiteGroups();
        const websites = await getWebsites();
        const dockerGroups = await getDockerGroups();
        const dockers = await getAllDockers();

        // 验证数据是否为数组
        if (!Array.isArray(websiteGroups)) {
            console.error('Website Groups data is not an array:', websiteGroups);
            return null;
        }
        if (!Array.isArray(websites)) {
            console.error('Websites data is not an array:', websites);
            return null;
        }
        if (!Array.isArray(dockerGroups)) {
            console.error('Docker Groups data is not an array:', dockerGroups);
            return null;
        }
        if (!Array.isArray(dockers)) {
            console.error('Docker containers data is not an array:', dockers);
            return null;
        }

        // 确保所有组都有 order 属性
        const allGroups = [
            ...(Array.isArray(websiteGroups) ? websiteGroups : []).map(group => ({ ...group, order: group.order || 0 })),
            ...(Array.isArray(dockerGroups) ? dockerGroups : []).map(group => ({ ...group, order: group.order || 0 }))
        ].sort((a, b) => a.order - b.order);

        console.log('Fetched and processed data:', { allGroups });

        return {
            websiteGroups: Array.isArray(websiteGroups) ? websiteGroups : [],
            websites: Array.isArray(websites) ? websites : [],
            dockerGroups: Array.isArray(dockerGroups) ? dockerGroups : [],
            dockers: Array.isArray(dockers) ? dockers : [],
            allGroups // 确保返回了 allGroups
        };
    } catch (error) {
        console.error('Failed to fetch main dashboard data:', error);
        return null;
    }
}

// 监听主线程的消息
self.addEventListener('message', async (event) => {
    if (event.data === 'fetchData') {
        const data = await fetchMainDashboardData();
        if (data) {
            self.postMessage(data); // 将数据发送回主线程
        } else {
            self.postMessage({ type: 'error', message: 'Failed to fetch data' });
        }
    }
});