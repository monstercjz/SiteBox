// loadModule.js 修正版
const moduleCache = new Map();
const MAX_RETRY = 2;
const MAX_CACHE_AGE = 30 * 60 * 1000;
export async function loadModule(modulePath) {
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            // 执行动态加载
            console.log(`[Attempt ${attempt}] 远程正在加载模块: ${modulePath}`);
            const module = await import(modulePath);
            performance.mark(`${modulePath}_loaded`); // 记录准确加载时间
            return module;
        } catch (error) {
            console.warn(`[Attempt ${attempt}] 模块加载失败: ${modulePath}`, error);
            if (attempt >= MAX_RETRY) {
                throw new Error(`模块加载失败: ${modulePath}`, { cause: error });
            }
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}
export async function loadModuleWithCashe(modulePath) {
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            // 统一缓存检查逻辑
            
            // const cached = getModuleFromCache(modulePath);
            // if (cached) {
            //     return cached;
            // }
            console.log(`[Attempt ${attempt}] 正在加载模块: ${modulePath}`);
            const cached = moduleCache.get(modulePath);
            if (cached && Date.now() - cached.timestamp < MAX_CACHE_AGE) {
                return cached.module;
            }
            // 执行动态加载
            console.log(`[Attempt ${attempt}] 远程正在加载模块: ${modulePath}`);
            const module = await import(modulePath);
            performance.mark(`${modulePath}_loaded`); // 记录准确加载时间
            
            // 统一缓存格式
            moduleCache.set(modulePath, { 
                module,
                timestamp: Date.now()
            });
            console.log('当前缓存占用:', getCacheMemoryUsage());
            return module;
        } catch (error) {
            console.warn(`[Attempt ${attempt}] 模块加载失败: ${modulePath}`, error);
            if (attempt >= MAX_RETRY) {
                throw new Error(`模块加载失败: ${modulePath}`, { cause: error });
            }
            await new Promise(r => setTimeout(r, 1000 * attempt));
            
            // 重试前清理旧缓存
            moduleCache.delete(modulePath);
        }
    }
}

export async function loadModuleReal(modulePath) {
    const cacheBust = Date.now(); // 添加时间戳
    const fullPath = `${modulePath}?cacheBust=${cacheBust}`;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            console.log(`[Attempt ${attempt}] 正在加载模块: ${fullPath}`);
            // 执行动态加载
            const module = await import(fullPath);
            performance.mark(`${fullPath}_loaded`); // 记录准确加载时间
            return module;
        } catch (error) {
            console.warn(`[Attempt ${attempt}] 模块加载失败: ${fullPath}`, error);
            if (attempt >= MAX_RETRY) {
                throw new Error(`模块加载失败: ${fullPath}`, { cause: error });
            }
            await new Promise(r => setTimeout(r, 1000 * attempt)); 
        }
    }
}
export async function loadAndExecute(modulePath, functionName, ...args) {
    try {
        if (!moduleCache.has(modulePath)) {
            const module = await import(modulePath);
            moduleCache.set(modulePath, module);
        }
        const module = moduleCache.get(modulePath);
        if (module[functionName]) {
            return module[functionName](...args);
        } else {
            console.error(`Function ${functionName} not found in module ${modulePath}`);
        }
    } catch (error) {
        console.error(`Failed to load module ${modulePath}:`, error);
    }
}
export function bindDynamicEventListeners(element, events, modulePath, functionName, ...args) {
    const handler = async (event) => {
        await loadAndExecute(modulePath, functionName, ...args, event);
    };
    events.forEach(event => element.addEventListener(event, handler));
}

// 示例：为 main 元素绑定多个事件
// bindDynamicEventListeners(
//     elements.main,
//     ['click'],
//     './modules/eventHandlers.js',
//     'handleDockerItemClick'
// );
function getModuleFromCache(modulePath) {
    const cached = moduleCache.get(modulePath);
    if (cached && Date.now() - cached.timestamp < MAX_CACHE_AGE) {
        return cached.module;
    }
    // 如果过期，删除缓存
    if (cached) {
        moduleCache.delete(modulePath);
        console.log(`[Lazy Clean] 过期模块清理: ${modulePath}`);
    }
    return null;
}
// 自动清理定时任务（保持原逻辑）
setInterval(() => {
    const now = Date.now();
    moduleCache.forEach((value, key) => {
        if (now - value.timestamp > MAX_CACHE_AGE) {
            moduleCache.delete(key);
            console.log(`[Auto Clean] 过期模块清理: ${key}`);
        }
    });
}, 60 * 1000);
// 添加内存统计方法
export function getCacheMemoryUsage() {
    let total = 0;
    moduleCache.forEach((value, key) => {
        total += new TextEncoder().encode(JSON.stringify(value)).length; // 更精确的字节长度
        total += new TextEncoder().encode(key).length;
    });
    return {
        moduleCount: moduleCache.size,
        estimatedMemory: `${(total / 1024).toFixed(2)}KB`
    };
}

// 使用示例
console.log('当前缓存占用:', getCacheMemoryUsage());