// dashboardWorker.js
// 注意：Worker 线程没有 localStorage/window，不能使用 config.js
// backendUrl 由主线程通过 postMessage 传入

let _backendUrl = '/api';

async function apiFetch(path, fallback = []) {
    try {
        const response = await fetch(`${_backendUrl}${path}`);
        const rawText = await response.text();

        let data = null;
        if (rawText) {
            try {
                data = JSON.parse(rawText);
            } catch (parseError) {
                throw new Error(`Non-JSON response (${response.status})`);
            }
        }

        if (!response.ok) {
            throw new Error(data?.error || `HTTP ${response.status}`);
        }

        if (!data?.success) {
            throw new Error(data?.error || 'API request failed');
        }

        return Array.isArray(data.data) ? data.data : fallback;
    } catch (error) {
        console.warn(`Fetch failed for ${path}:`, error);
        return fallback;
    }
}

/**
 * 获取主仪表盘数据，包括网站和 Docker 数据
 */
async function fetchMainDashboardData() {
    const [websiteGroups, websites, dockerGroups, dockers] = await Promise.all([
        apiFetch('/website-groups', []),
        apiFetch('/websites', []),
        apiFetch('/docker-groups', []),
        apiFetch('/dockers', []),
    ]);

    const allGroups = [
        ...websiteGroups.map(group => ({ ...group, order: group.order || 0 })),
        ...dockerGroups.map(group => ({ ...group, order: group.order || 0 })),
    ].sort((a, b) => a.order - b.order);

    return {
        websiteGroups,
        websites,
        dockerGroups,
        dockers,
        allGroups,
    };
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
