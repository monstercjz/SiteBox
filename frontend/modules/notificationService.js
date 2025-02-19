/**
 * 显示通知消息 (仅发送消息给主线程)
 * @param {HTMLElement} notification - 通知元素
 * @param {string} message - 通知消息内容
 * @param {string} [type='info'] - 通知类型，可选值为 'info', 'success', 'error'
 */
// export function showNotification(notification, message, type = 'info') {
//     postMessage({ type: 'notification', notificationElement: notification, message, notificationType: type });
// }
const notification = document.createElement('div');

/**
 * 显示通知消息
 * @param {string} message - 通知消息内容
 * @param {string} [type='info'] - 通知类型，可选值为 'info', 'success', 'error'
 */
export function showNotification(message, type = 'info') {
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.transform = 'translateX(0)';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.transform = 'translateY(-20px)';
    notification.style.opacity = '0';
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
