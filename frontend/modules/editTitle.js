document.addEventListener('DOMContentLoaded', () => {
  const siteTitleElement = document.querySelector('.site-name');
  const editButton = document.querySelector('.edit-h1-button');
  const header = document.querySelector('header');

  editButton.addEventListener('click', () => {
    const currentTitle = siteTitleElement.textContent;
    siteTitleElement.style.display = 'none'; // 隐藏原始标题
    editButton.style.display = 'none'; // 隐藏编辑按钮

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentTitle;
    inputElement.className = 'edit-title-input'; // 添加 CSS 类名
    header.insertBefore(inputElement, siteTitleElement.parentNode); // 将输入框插入到 header 中，标题之前
    inputElement.focus();

    inputElement.addEventListener('blur', () => {
      const newTitle = inputElement.value.trim();
      siteTitleElement.textContent = newTitle || 'SiteBox'; // 更新标题，如果为空则使用默认标题
      siteTitleElement.style.display = 'inline-block'; // 显示标题
      editButton.style.display = 'inline-block'; // 显示编辑按钮
      inputElement.remove(); // 移除输入框
    });

    inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        inputElement.blur(); // Enter 键保存标题
      } else if (event.key === 'Escape') {
        siteTitleElement.style.display = 'inline-block'; // 显示标题
        editButton.style.display = 'inline-block'; // 显示编辑按钮
        inputElement.remove(); // 移除输入框
      }
    });
  });
});