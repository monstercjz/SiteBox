// 动态加载模块的通用函数
async function loadModule(modulePath) {
    try {
        const module = await import(modulePath);
        return module;
    } catch (error) {
        console.error('模块加载失败:', error);
        throw error;
    }
}

// // 使用示例
// async function handleImportButtonClick() {
//     try {
//         const { WebsiteImportModalHandler } = await loadModule('./modules/websiteImportModalHandler.js');
//         const handler = new WebsiteImportModalHandler();
//         await handler.showImportModal();
//     } catch (error) {
//         console.error('导入模块加载失败:', error);
//     }
// }