document.addEventListener('DOMContentLoaded', () => {
  const siteFrame = document.getElementById('siteFrame');
  // 从本地存储读取 iframe 地址并设置 iframe 的 src 属性
  chrome.storage.local.get(['iframeAddress'], function(result) {
    siteFrame.src = result.iframeAddress || 'http://192.168.3.247'; // 默认 iframe 地址
  });
});