// backendSettingService.js
// 提供「后端地址设置」面板，允许用户在页面中直接填写并保存 backendUrl 到 localStorage
// 保存后自动刷新页面使配置生效

import { showNotification } from './utils.js';
import { backendUrl } from '../config.js';

const STORAGE_KEY = 'backendUrl';
const DOCKER_REALTIME_KEY = 'dockerRealtimeEnabled'; // Docker实时信息获取开关
const PANEL_ID = 'backend-setting-panel';
const OVERLAY_ID = 'backend-setting-overlay';

/**
 * 获取Docker实时信息获取开关状态
 * @returns {boolean} true表示开启，false表示关闭（默认开启）
 */
export function getDockerRealtimeEnabled() {
  const stored = localStorage.getItem(DOCKER_REALTIME_KEY);
  // 默认返回true（开启），只有明确设置为'false'时才关闭
  return stored !== 'false';
}

/**
 * 设置Docker实时信息获取开关状态
 * @param {boolean} enabled - true开启，false关闭
 */
export function setDockerRealtimeEnabled(enabled) {
  localStorage.setItem(DOCKER_REALTIME_KEY, enabled ? 'true' : 'false');
}

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
  const apiBaseUrl = backendUrl;
  const cachedHost = localStorage.getItem(STORAGE_KEY);
  const sourceLabel = currentUrl ? '手动设置（localStorage）' : '默认配置';
  const cachedHostLabel = cachedHost || '（未设置）';



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

  // 添加自定义checkbox样式
  const style = document.createElement('style');
  style.textContent = `
    #docker-realtime-check:checked::after,
    #backend-url-clear-check:checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color-primary, #3b82f6);
      font-size: 14px;
      font-weight: bold;
    }
    #docker-realtime-check:checked,
    #backend-url-clear-check:checked {
      background-color: var(--background-card, #fff) !important;
      border-color: var(--color-primary, #3b82f6) !important;
    }
  `;
  document.head.appendChild(style);

  panel.innerHTML = `
    <div class="modal-content">
      <h2>后端地址设置</h2>
      <button class="close-modal-button" id="backend-setting-close" aria-label="关闭">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div style="margin-bottom: 0.875rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-tertiary);">
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.2rem;">本地缓存后端地址（localStorage）</div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all;">${cachedHostLabel}</div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 0.2rem;">当前生效 API 地址</div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all;">${apiBaseUrl}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.35rem;">来源：${sourceLabel}</div>
      </div>


      <p style="margin-bottom: 0.75rem; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.6;">
        只填写「后端主机地址」，不要加 <code>/api</code>，程序会自动拼接。<br>
        示例：
      </p>
      <ul style="margin: 0 0 0.875rem 1.1rem; padding: 0; color: var(--text-secondary); font-size: 0.82rem; line-height: 1.7;">
        <li>Cloudflare Workers 自定义域名：<code>https://api.your-domain.com</code></li>
        <li>自有 VPS + 域名（Nginx/Caddy 反代）：<code>https://api.example.com</code></li>
        <li>自有 VPS 直连端口：<code>http://服务器IP:3000</code> 或 <code>https://api.example.com:3000</code></li>
        <li>本地开发：<code>http://localhost:3000</code></li>
      </ul>

      <p style="margin: 0 0 0.75rem; color: var(--text-secondary); font-size: 0.78rem; line-height: 1.6;">
        若前端是 HTTPS，后端也应使用 HTTPS（否则会被浏览器拦截 Mixed Content）。
      </p>

      <input
        id="backend-url-input"
        type="text"
        placeholder="留空使用默认，或填 https://api.example.com"
        value="${currentUrl}"
        style="width: 100%; box-sizing: border-box;"
      />
      <div style="width: 100%; margin-top: 0.75rem; margin-bottom: 1rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-tertiary); box-sizing: border-box;">
        <label style="display: flex; align-items: center; cursor: pointer; width: 100%;">
          <input type="checkbox" id="backend-url-clear-check"
            style="width: 1.25rem; height: 1.25rem; min-width: 1.25rem; cursor: pointer;
                   -webkit-appearance: none; appearance: none;
                   background-color: var(--background-card, #fff);
                   border: 2px solid var(--border-color, #ccc);
                   border-radius: 4px;
                   display: inline-block;
                   position: relative;
                   vertical-align: middle;
                   flex-shrink: 0;
                   margin: 0;
                   box-sizing: border-box;" />
          <span style="color: var(--text-primary); font-size: 0.85rem; margin-left: 0.5rem; flex: 1;">清除手动设置，恢复默认地址</span>
        </label>
      </div>
      <div style="width: 100%; margin-bottom: 1rem; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--background-tertiary); box-sizing: border-box;">
        <label style="display: flex; align-items: center; cursor: pointer; width: 100%;">
          <input type="checkbox" id="docker-realtime-check"
            style="width: 1.25rem; height: 1.25rem; min-width: 1.25rem; cursor: pointer;
                   -webkit-appearance: none; appearance: none;
                   background-color: var(--background-card, #fff);
                   border: 2px solid var(--border-color, #ccc);
                   border-radius: 4px;
                   display: inline-block;
                   position: relative;
                   vertical-align: middle;
                   flex-shrink: 0;
                   margin: 0;
                   box-sizing: border-box;" />
          <span style="color: var(--text-primary); font-size: 0.85rem; margin-left: 0.5rem; flex: 1;">启用 Docker 实时信息获取（CPU、内存、网络等）</span>
        </label>
      </div>
      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
        关闭后不再自动获取 Docker 容器的实时状态信息，适用于部署在 Cloudflare 等无法访问 Docker API 的环境。
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

  // 初始化Docker实时信息开关状态
  const dockerRealtimeCheck = document.getElementById('docker-realtime-check');
  dockerRealtimeCheck.checked = getDockerRealtimeEnabled();

  // 勾选「清除设置」时禁用输入框
  document.getElementById('backend-url-clear-check').addEventListener('change', (e) => {
    document.getElementById('backend-url-input').disabled = e.target.checked;
  });

  document.getElementById('backend-setting-close').addEventListener('click', closePanel);
  document.getElementById('backend-setting-cancel').addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  document.getElementById('backend-setting-save').addEventListener('click', () => {
    const clearCheck = document.getElementById('backend-url-clear-check').checked;
    const dockerRealtimeEnabled = document.getElementById('docker-realtime-check').checked;

    // 保存Docker实时信息开关设置
    setDockerRealtimeEnabled(dockerRealtimeEnabled);

    if (clearCheck) {
      localStorage.removeItem(STORAGE_KEY);
      showNotification('已恢复默认地址（/api），即将刷新页面', 'success');
      setTimeout(() => location.reload(), 1200);
      return;
    }

    const inputVal = document.getElementById('backend-url-input').value.trim();
    if (!inputVal) {
      localStorage.removeItem(STORAGE_KEY);
      showNotification('已恢复默认地址，即将刷新页面', 'success');
      setTimeout(() => location.reload(), 1200);
      return;
    }

    if (!/^https?:\/\//.test(inputVal)) {
      showNotification('地址格式不正确，请以 http:// 或 https:// 开头', 'error');
      return;
    }

    let normalizedUrl;
    try {
      const parsedUrl = new URL(inputVal);
      if (parsedUrl.pathname !== '/' && parsedUrl.pathname !== '/api') {
        showNotification('请只填写主机地址，不要带路径（如 /v1）', 'error');
        return;
      }
      normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch (error) {
      showNotification('地址格式无效，请检查后重试', 'error');
      return;
    }

    localStorage.setItem(STORAGE_KEY, normalizedUrl);
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
