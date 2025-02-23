// UnifiedTooltipService.js
import { getWebsiteById } from './api.js';
import { TooltipDomService } from './tooltipDomService.js';
import { TooltipCacheService } from './tooltipCacheService.js';
import { TooltipErrorService } from './tooltipErrorService.js';
import {
  CONTEXT_MENU_ID,
  EVENT_CONTEXTMENU,
  DATA_DOCKER_SERVER_PORT,
  DATA_DOCKER_SERVER_IP,
  DATA_DESCRIPTION,
  DATA_ITEM_ID,
  TOOLTIP_CONTENT_TEMPLATE,
  DEFAULT_PLACEHOLDER,
} from '../config.js';
import { escapeHtml } from "./utils.js";

const config = {
  hoverDelay: 250,
  autoCloseDelay: 5000,
  debounceDelay: 500,
  fadeOutDuration: 150,
  cache: { expiration: 1000 * 60 * 10 },
  maxConcurrentRequests: 3,
  requestMergeThreshold: 300
};

export class UnifiedTooltipService {
  static instance = null; // 单例实例

  constructor() {
    if (UnifiedTooltipService.instance) {
      return UnifiedTooltipService.instance;
    }

    this.currentHoverTarget = null;
    this.currentitemId = null;
    this.activeTimers = new Map();
    this.pendingRequests = new Map();
    this.domService = new TooltipDomService();
    this.cacheService = new TooltipCacheService();
    this.errorService = new TooltipErrorService(this.domService);
    this.concurrentRequestCount = 0;
    this.requestQueue = [];
    this.abortControllerMap = new Map();
    this.recentRequests = new Map();
    this.cachedContextMenu = null;

    // 绑定 mouseout 事件监听器
    document.addEventListener('mouseout', this.handleElementLeave.bind(this), true);

    // 绑定 contextmenu 和 click 事件
    document.addEventListener(EVENT_CONTEXTMENU, () => {
      this.cachedContextMenu = document.getElementById(CONTEXT_MENU_ID);
    });
    document.addEventListener('click', () => {
      this.cachedContextMenu = null;
    });
    window.addEventListener('beforeunload', () => this.domService.destroy());

    UnifiedTooltipService.instance = this; // 保存实例
  }

  // 获取单例实例
  static getInstance() {
    if (!UnifiedTooltipService.instance) {
      UnifiedTooltipService.instance = new UnifiedTooltipService();
    }
    return UnifiedTooltipService.instance;
  }

  // 元素离开处理
  handleElementLeave(event) {
    const target = event.target.closest('[data-item-id]');
    if (!target) return;

    this.clearElementTimers(target);
    if (this.currentTooltip?.targetElement === target) {
      this._cleanupTooltip(this.currentTooltip);
      this.currentHoverTarget = null;
    }
  }

  // 处理悬停逻辑
  handleItemHover(target) {
    const itemId = target.dataset.itemId;
    this._preloadAdjacentData(target);

    const debounceTimer = setTimeout(() => {
      this._processHoverAction(target, itemId);
    }, config.debounceDelay);

    this.storeTimer(target, debounceTimer);
  }

  async _processHoverAction(target, itemId) {
    if (!this.isElementValid(target)) return;

    try {
      let data;
      if (this.isDockerItem(target)) {
        data = await this._getDockerData(itemId, target);
      } else {
        data = await this._getWebsiteData(itemId);
      }

      if (!this.isElementValid(target)) return;

      this._showTooltip(target, data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.errorService.handleWebsiteDataError(target, error);
      }
    }
  }

  isDockerItem(target) {
    return target.classList.contains('docker-item');
  }

  async _getWebsiteData(itemId) {
    if (this.pendingRequests.has(itemId)) {
      return this.pendingRequests.get(itemId);
    }

    const cachedData = this.cacheService.getCachedData(itemId);
    if (cachedData) {
      return cachedData;
    }

    if (this.recentRequests.has(itemId)) {
      const recent = this.recentRequests.get(itemId);
      if (Date.now() - recent.timestamp < config.requestMergeThreshold) {
        return recent.promise;
      }
    }

    if (this.concurrentRequestCount >= config.maxConcurrentRequests) {
      return new Promise(resolve => {
        this.requestQueue.push({ itemId, resolve });
      });
    }

    this.concurrentRequestCount++;
    const abortController = new AbortController();
    this.abortControllerMap.set(itemId, abortController);

    const requestPromise = getWebsiteById(itemId, abortController.signal)
      .then(website => {
        if (!website?.url) throw new Error('Invalid data');
        this.cacheService.setCacheData(itemId, website);
        return website;
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          this.cacheService.setCacheData(itemId, { error: true });
          throw error;
        }
        return null;
      })
      .finally(() => {
        this.pendingRequests.delete(itemId);
        this.concurrentRequestCount--;
        this.abortControllerMap.delete(itemId);
        this._processRequestQueue();
      });

    this.recentRequests.set(itemId, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    return requestPromise;
  }

  async _getDockerData(target) {
    // Docker 数据不需要异步请求，直接从 DOM 中获取
    const urlPort = target.getAttribute(DATA_DOCKER_SERVER_PORT) || DEFAULT_PLACEHOLDER;
    const server = target.getAttribute(DATA_DOCKER_SERVER_IP) || DEFAULT_PLACEHOLDER;
    const serverPort = target.getAttribute(DATA_DOCKER_SERVER_PORT) || DEFAULT_PLACEHOLDER;
    const description = target.getAttribute(DATA_DESCRIPTION) || DEFAULT_PLACEHOLDER;

    return {
      urlPort,
      server,
      serverPort,
      description
    };
  }

  _showTooltip(target, data) {
    if (!this.isElementValid(target)) return;
    if (this._checkContextMenuPresence()) return;

    this._removeCurrentTooltip();

    const tooltip = this.domService.createTooltipElement();
    tooltip.innerHTML = this.generateTooltipContent(target, data);
    tooltip.targetElement = target;

    document.body.appendChild(tooltip);
    this.domService.showTooltip(tooltip);
    requestAnimationFrame(() => {
      this.domService.positionTooltip(tooltip, target);
      this.currentTooltip = tooltip;
      this.currentitemId = target.dataset.itemId;
  });
    const autoCloseTimer = setTimeout(() => {
      this._cleanupTooltip(tooltip);
    }, config.autoCloseDelay);

    this.storeTimer(target, autoCloseTimer);
    
  }

  generateTooltipContent(target, data) {
    if (this.isDockerItem(target)) {
      return this.generateTooltipContentForDocker(data);
    } else {
      return this.generateTooltipContentForWebsite(data);
    }
  }

  generateTooltipContentForWebsite(website) {
    if (website?.error) {
      return '<div class="tooltip-error">数据加载失败</div>';
    }
    if (!website?.lastAccessTime) {
      return '<div class="tooltip-error">数据无效</div>';
    }

    const lastAccessTime = new Date(website.lastAccessTime).toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      hour12: false
    });

    return `
      <div class="tooltip-content">
        <div class="tooltip-row"><strong>网址:</strong> ${escapeHtml(website.url)}</div>
        <div class="tooltip-row"><strong>最后访问:</strong> ${lastAccessTime}</div>
        ${website.description ? `
          <div class="tooltip-row"><strong>描述:</strong> ${escapeHtml(website.description)}</div>
        ` : ''}
      </div>
    `;
  }

  generateTooltipContentForDocker(data) {
    return TOOLTIP_CONTENT_TEMPLATE
      .replace('{{urlPort}}', data.urlPort)
      .replace('{{server}}', data.server)
      .replace('{{serverPort}}', data.serverPort)
      .replace('{{description}}', data.description);
  }

  _checkContextMenuPresence() {
    return this.cachedContextMenu && document.getElementById(CONTEXT_MENU_ID);
  }

  _removeCurrentTooltip() {
    if (this.currentTooltip) {
      this.domService.removeCurrentTooltip();
      this.currentTooltip = null;
      this.currentitemId = null;
    }
  }

  _cleanupTooltip(tooltip) {
    if (tooltip && document.body.contains(tooltip)) {
      this.domService.hideTooltip(tooltip, () => {
        document.body.removeChild(tooltip);
      });
    }
  }

  _preloadAdjacentData(target) {
    const allTargets = Array.from(document.querySelectorAll('[data-item-id]'));
    const currentIndex = allTargets.indexOf(target);
    if (currentIndex === -1) return;

    [currentIndex - 1, currentIndex + 1].forEach(index => {
      if (index >= 0 && index < allTargets.length) {
        const adjacent = allTargets[index];
        if (!this.isElementInViewport(adjacent)) return;

        const adjacentId = adjacent.dataset.itemId;
        if (!this.cacheService.getCachedData(adjacentId) && !this.pendingRequests.has(adjacentId)) {
          if (this.isDockerItem(adjacent)) {
            this._getDockerData(adjacentId, adjacent);
          } else {
            this._getWebsiteData(adjacentId);
          }
        }
      }
    });
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  _processRequestQueue() {
    if (this.requestQueue.length > 0 && this.concurrentRequestCount < config.maxConcurrentRequests) {
      const { itemId, resolve } = this.requestQueue.shift();
      resolve(this._getWebsiteData(itemId));
    }
  }

  // 状态验证方法
  isElementValid(target) {
    return this.currentHoverTarget === target &&
           target.isConnected &&
           target.matches(':hover');
  }

  // 计时器管理
  storeTimer(target, timerId) {
    if (!this.activeTimers.has(target)) {
      this.activeTimers.set(target, []);
    }
    this.activeTimers.get(target).push(timerId);
  }

  clearElementTimers(target) {
    const timers = this.activeTimers.get(target);
    if (timers) {
      timers.forEach(clearTimeout);
      this.activeTimers.delete(target);
    }
  }
}

// 独立的 handleElementEnter 函数
export function handleElementEnter(event) {
  const tooltipService = UnifiedTooltipService.getInstance(); // 获取单例实例
  const target = event.target.closest('[data-item-id]');
  if (!target || !target.dataset.itemId) return;

  tooltipService.currentHoverTarget = target;
  tooltipService.clearElementTimers(target);
  tooltipService.handleItemHover(target);
}