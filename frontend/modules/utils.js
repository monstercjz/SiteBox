// utils.js - 工具函数模块

/**
 * Debounce function to limit function execution rate.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} - Debounced function.
 */
// function debounce(func, wait) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }
function debounce(func, delay) {
  let timer;
  return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
  };
}
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
      if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
      }
  };
}
function safeExecute(fn, errorMessage = 'An error occurred') {
  try {
      fn();
  } catch (error) {
      console.error(errorMessage, error);
  }
}
function logEvent(eventType, details = {}) {
  console.log(`[${new Date().toISOString()}] ${eventType}:`, details);
}


// utils.js - 工具函数模块

/**
 * @function validateAndCompleteUrl
 * @description URL 校验和补全函数，校验 URL 格式是否有效，并补全 URL 协议头
 * @param {string} url URL 字符串
 * @returns {string | null} 校验和补全后的 URL，如果 URL 无效则返回 null
 */
function validateAndCompleteUrl(url) {
    const urlRegex = /^[^\s/$.?#].[^\s]*$/i; // URL 正则表达式
    if (!urlRegex.test(url)) {
        showNotification('请输入有效的URL', 'error'); // 显示错误提示
        return null; // URL 无效，返回 null
    }
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        // 如果 URL 没有协议头，则自动添加 https:// 协议头
        return 'https://' + url;
    }
    return url; // URL 校验通过，返回原始 URL 或补全协议头后的 URL
}

let currentTooltip = null; // 当前显示的 tooltip 元素
let tooltipTimeout = null; // tooltip 消失定时器

/**
 * @function showTooltip
 * @description 显示 tooltip
 * @param {Event} e 鼠标事件对象
 */
function showTooltip(e) {
    const target = e.target.closest('[data-tooltip]'); // 获取最近的 data-tooltip 元素
    if (target) {
        if (!currentTooltip) {
            // 如果 currentTooltip 不存在，则创建 tooltip 元素
            currentTooltip = document.createElement('div');
            currentTooltip.style.position = 'absolute'; // 设置 position: absolute;
            currentTooltip.id = 'tooltip'; // 设置 tooltip ID
            document.body.appendChild(currentTooltip); // 将 tooltip 添加到 body 中
        }
        const tooltipText = target.getAttribute('data-tooltip'); // 获取 data-tooltip 属性值
        currentTooltip.textContent = tooltipText; // 设置 tooltip 文本内容
        currentTooltip.style.display = 'block'; // 显示 tooltip
        const rect = target.getBoundingClientRect(); // 获取目标元素 Rect
        console.log(rect);
                currentTooltip.style.left = `${rect.left - currentTooltip.offsetWidth - 10}px`; //  按钮左侧，留出间距
                currentTooltip.style.top = `${rect.top + rect.height / 2 - 15}px`; // 与按钮垂直中心对齐，并向上偏移

        // 清除之前的定时器，防止重复触发
        clearTimeout(tooltipTimeout);
        // 设置 5 秒后自动隐藏 tooltip
        tooltipTimeout = setTimeout(() => {
            hideTooltip(e); // 调用 hideTooltip 函数隐藏 tooltip
        }, 1500); // 5 秒后自动隐藏 tooltip
    }
}

/**
 * @function hideTooltip
 * @description 隐藏 tooltip
 * @param {Event} e 鼠标事件对象
 */
function hideTooltip(e) {
    const target = e.target.closest('[data-tooltip]'); // 获取最近的 data-tooltip 元素
    
    if (target && currentTooltip) {
      console.log('hideTooltip', target);
        currentTooltip.style.display = 'none'; // 隐藏 tooltip
        currentTooltip.remove(); // 从 DOM 中移除 tooltip
        currentTooltip = null; // 清空 currentTooltip 引用
    }
}

/**
 * @function escapeHtml
 * @description HTML 字符转义函数，防止 XSS 攻击 
 * @param {string} unsafe 包含 HTML 字符的字符串
 * @returns {string} 转义后的 HTML 字符串
 */
function escapeHtml(unsafe) {
    return unsafe ?
      unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
      : '';
  }

/**
 * @function generateTooltipContent
 * @description 生成 tooltip 内容 HTML 字符串
 * @param {Website} website 网站数据对象
 * @returns {string} tooltip 内容 HTML 字符串
 */
function generateTooltipContent(website) {
    if (!website || !website.lastAccessTime) {
      return '<div class="tooltip-content error">数据无效</div>'; // 数据无效时显示错误提示
    }
    const lastAccessTime = new Date(website.lastAccessTime).toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai', // 设置时区为上海
      hour12: false // 24 小时制
    });

    let content = '<div class="tooltip-content">';
    content += '<div class="tooltip-row"><strong>网址:</strong> ' + escapeHtml(website.url) + '</div>';
    content += '<div class="tooltip-row"><strong>最后访问:</strong> ' + lastAccessTime + '</div>';
    if (website.description) {
      content += '<div class="tooltip-row"><strong>描述:</strong> ' + escapeHtml(website.description) + '</div>';
    }
    content += '</div>';
    return content;
  }



export { validateAndCompleteUrl, showTooltip, hideTooltip, escapeHtml, generateTooltipContent,debounce,throttle,safeExecute,logEvent};
