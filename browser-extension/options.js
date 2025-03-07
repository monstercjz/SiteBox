document.addEventListener('DOMContentLoaded', () => {
  const apiAddressInput = document.getElementById('api-address');
  const iframeAddressInput = document.getElementById('iframe-address');
  const saveBtn = document.getElementById('saveBtn');

  // 从本地存储读取 API 地址并显示在输入框中
  chrome.storage.local.get(['apiAddress', 'iframeAddress'], function(result) {
    apiAddressInput.value = result.apiAddress || 'http://192.168.3.247:3001'; // 默认 API 地址
    iframeAddressInput.value = result.iframeAddress || 'http://192.168.3.247'; // 默认 iframe 地址
  });

  // 保存按钮点击事件监听器
  saveBtn.addEventListener('click', () => {
    const apiAddress = apiAddressInput.value;
    const iframeAddress = iframeAddressInput.value;
    // 保存 API 地址和 iframe 地址到本地存储
    chrome.storage.local.set({apiAddress: apiAddress, iframeAddress: iframeAddress}, function() {
      alert('API 地址和 iframe 地址已保存'); // 提示用户保存成功
    });
  });
});