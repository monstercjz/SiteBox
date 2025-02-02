document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const descriptionInput = document.getElementById('description');
  const groupSelect = document.getElementById('group');
  const saveBtn = document.getElementById('saveBtn');

  // 获取当前标签页的 URL 和标题
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentTab = tabs[0];
    urlInput.value = currentTab.url;
    titleInput.value = currentTab.title;
  });

  // 获取全部分组并填充下拉框
  fetch('http://localhost:3000/groups') // 后端 API 地址，修改为 /groups
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        data.data.forEach(group => {
          const option = document.createElement('option');
          option.value = group.id;
          option.textContent = group.name;
          groupSelect.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error fetching groups:', error);
    });

  saveBtn.addEventListener('click', () => {
    const url = urlInput.value;
    const title = titleInput.value;
    const description = descriptionInput.value;
    const groupId = groupSelect.value;

    // 判断是否选择了分组
    if (!groupId) {
      // 检查默认分组是否存在，如果不存在则创建
      fetch('http://localhost:3000/groups/default') // 检查默认分组的 API 地址，修改为 /groups/default
        .then(response => {
          if (!response.ok) {
            // 默认分组不存在，创建默认分组
            return fetch('http://localhost:3000/groups', { // 创建分组的 API 地址，修改为 /groups
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name: 'Default Group',isCollapsible: false }) // 默认分组名称
            })
            .then(response => response.json())
            .then(data => {
              // 创建默认分组成功后，将网站数据保存到默认分组
              return saveWebsiteData(url, title, description, data.data.id);
            });
          } else {
            return response.json().then(data => {
              // 默认分组已存在，将网站数据保存到默认分组
              return saveWebsiteData(url, title, description, data.group.id);
            });
          }
        });
    } else {
      // 已选择分组，直接保存网站数据
      saveWebsiteData(url, title, description, groupId);
    }
  });

  // 保存网站数据到后端 API
  function saveWebsiteData(url, title, description, groupId) {
    fetch('http://localhost:3000/plugin/extension/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url, title: title, description: description, groupId: groupId}) // 添加 faviconUrl: ''
    })
    .then(response => response.json())
    .then(data => { // 修正此处
      if (data.success) {
        const successMessage = document.getElementById('success-message');
        successMessage.textContent = (data.success ? data.success + ', ' : '') + '网站保存成功!'; // 显示 data.success 和默认消息
        successMessage.style.display = 'block'; // 显示成功消息
        setTimeout(() => {
          successMessage.style.display = 'none'; // 3秒后隐藏成功消息
        }, 3000);
      } else {
        const successMessage = document.getElementById('success-message');
        successMessage.textContent = data.success || '保存失败，请检查控制台错误日志'; // 显示 data.success 或默认错误消息
        successMessage.style.display = 'block'; // 显示错误消息
        successMessage.style.color = 'red'; // 错误消息显示为红色
        setTimeout(() => {
          successMessage.style.display = 'none'; // 3秒后隐藏错误消息
          successMessage.style.color = 'green'; // 恢复成功消息颜色，以便下次成功时显示绿色
        }, 3000);
        console.error('保存失败，请检查返回的数据:', data);
      }
    })
    .catch(error => {
      console.error('Error saving website:', error);
      console.error('发送失败，请检查控制台错误日志');
    });
  }
});