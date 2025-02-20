// frontend/modules/workerService.js

/**
 * 创建并运行 Web Worker
 * @param {string} workerPath - Worker 文件的路径
 * @param {string} message - 发送到 Worker 的消息
 * @returns {Promise} - 返回一个 Promise，解析为 Worker 返回的数据
 */
export function createAndRunWorker(workerPath, message) {
    return new Promise((resolve, reject) => {
        // 创建 Web Worker
        // const workerPath = './dashboardWorker.js';
        const timestamp = new Date().getTime();
        const workerUrl = new URL(`${workerPath}?v=${timestamp}`, import.meta.url);
        const worker = new Worker(workerUrl, { type: 'module' });
        // const worker = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });

        // 监听来自 Worker 的消息
        worker.onmessage = (event) => {
            const data = event.data;
            worker.terminate(); // 关闭 Worker
            console.log('Worker stop:');
            resolve(data); // 返回数据
        };

        // 监听 Worker 错误
        worker.onerror = (error) => {
            console.error('Worker error:', error);
            
            worker.terminate(); // 关闭 Worker
            reject(error); // 返回错误
        };

        // 向 Worker 发送消息以触发数据获取
        worker.postMessage(message);
    });
}