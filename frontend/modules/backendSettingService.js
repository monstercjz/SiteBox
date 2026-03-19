// backendSettingService.js
// 提供「后端地址设置」面板，允许用户在页面中直接填写并保存 backendUrl 到 localStorage
// 保存后自动刷新页面使配置生效

import { showNotification } from './utils.js';

const STORAGE_KEY = 'backendUrl';
const PANEL_ID = 'backend-setting-panel';
const OVERLAY_ID = 'backend-setting-overlay';

/**
 * 获取当前生效的 backendUrl
 */
export function getBackendUrl() {
  return localStorage.getItem(STORAGE_KEY) || '/api';
}

/**
 * 初始化设置服务：绑定按钮事件，首次未设置时自动弹出引导
 */
export function initBackendSettingService() {
  const triggerBtn = document.getElementById('backend-setting-button');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', openPanel);
  }

  // 首次未设置时自动弹出引导（仅当 localStorage 里没有值）
  if (!localStorage.getItem(STORAGE_KEY)) {
    openPanel();
  }
}

/**
 * 打开设置面板
 */
function openPanel() {
  if (document.getElementById(PANEL_ID)) return;

  const currentUrl = localStorage.getItem(STORAGE_KEY) || '';

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 1000;
    backdrop-filter: blur(2px);
  `;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.className = 'modal show-modal';
  panel.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    width: 90%;
    max-width: 31.25rem;
    padding: 2rem;
    opacity: 1;
  `;

  panel.innerHTML = `
    <div class="modal-content">
      <h2>后端地址设置</h2>
      <button class="close-modal-button" id="backend-setting-close" aria-label="关闭">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
        填写后端服务器地址，程序会自动加上 <code>/api</code>，结尾不要加 <code>/</code>。<br>
        · 有反向代理（Docker/nginx）→ 留空或填 <code>（默认）</code><br>
        · 本地开发 → 填 <code>http://localhost:3000</code><br>
        · 远端服务器 → 填 <code>http://服务器IP:端口</code>
      </p>
      <input
        id="backend-url-input"
        type="text"
        placeholder="留空使用默认，或填 http://localhost:3000"
        value="${currentUrl}"
        style="width: 100%; box-sizing: border-box;"
      />
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; margin-bottom: 1rem;">
        <input type="checkbox" id="backend-url-clear-check" style="width: auto; margin-bottom: 0;" />
        <label for="backend-url-clear-check" style="color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;">
          清除设置，恢复默认（使用反向代理 <code>/api</code>）
        </label>
      </div>
      <div class="modal-buttons-container">
        <button class="cancel-modal-button" id="backend-setting-cancel">取消</button>
        <button class="save-modal-button" id="backend-setting-save">保存并刷新</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // 聚焦输入框
  setTimeout(() => {
    const input = document.getElementById('backend-url-input');
    if (input) input.focus();
  }, 50);

  // 勾选「清除设置」时禁用输入框
  document.getElementById('backend-url-clear-check').addEventListener('change', (e) => {
    document.getElementById('backend-url-input').disabled = e.target.checked;
  });

  document.getElementById('backend-setting-close').addEventListener('click', closePanel);
  document.getElementById('backend-setting-cancel').addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  document.getElementById('backend-setting-save').addEventListener('click', () => {
    const clearCheck = document.getElementById('backend-url-clear-check').checked;

    if (clearCheck) {
      localStorage.removeItem(STORAGE_KEY);
      showNotification('已恢复默认地址（/api），即将刷新页面', 'success');
      setTimeout(() => location.reload(), 1200);
      return;
    }

    const inputVal = document.getElementById('backend-url-input').value.trim();
    if (!inputVal) {
      showNotification('请输入后端地址', 'error');
      return;
    }

    // 基本格式校验：必须以 http:// 或 https:// 开头（不含 /api，程序自动补）
    if (!/^https?:\/\//.test(inputVal)) {
      showNotification('地址格式不正确，请以 http:// 或 https:// 开头', 'error');
      return;
    }

    // 去掉末尾多余的 /api 或 /，统一由 config.js 拼接
    const cleanVal = inputVal.replace(/\/api\/?$/, '').replace(/\/$/, '');

    localStorage.setItem(STORAGE_KEY, cleanVal);
    showNotification('后端地址已保存，即将刷新页面', 'success');
    setTimeout(() => location.reload(), 1200);
  });

  // Enter 键保存
  document.getElementById('backend-url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('backend-setting-save').click();
    }
  });
}

/**
 * 关闭设置面板
 */
function closePanel() {
  document.getElementById(PANEL_ID)?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
}
