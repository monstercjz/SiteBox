// dashboardWorker.js
// 注意：Worker 线程没有 localStorage/window，不能使用 config.js
// backendUrl 由主线程通过 postMessage 传入

let _backendUrl = '/api';

async function apiFetch(path) {
    const response = await fetch(`${_backendUrl}${path}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'API request failed');
    return data.data;
}

/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 */
async function fetchMainDashboardData() {
    try {
        const [websiteGroups, websites, dockerGroups, dockers] = await Promise.all([
            apiFetch('/website-groups'),
            apiFetch('/websites'),
            apiFetch('/docker-groups'),
            apiFetch('/dockers'),
        ]);

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
            allGroups
        };
    } catch (error) {
        console.error('Failed to fetch main dashboard data:', error);
        return null;
    }
}

// 监听主线程的消息
self.addEventListener('message', async (event) => {
    const msg = event.data;
    // 支持携带 backendUrl 的对象消息：{ type: 'fetchData', backendUrl: '...' }
    if (msg && typeof msg === 'object' && msg.type === 'fetchData') {
        if (msg.backendUrl) {
            _backendUrl = msg.backendUrl;
        }
        const data = await fetchMainDashboardData();
        if (data) {
            self.postMessage(data);
        } else {
            self.postMessage({ type: 'error', message: 'Failed to fetch data' });
        }
    } else if (msg === 'fetchData') {
        // 兼容旧的字符串消息格式
        const data = await fetchMainDashboardData();
        if (data) {
            self.postMessage(data);
        } else {
            self.postMessage({ type: 'error', message: 'Failed to fetch data' });
        }
    }
});
