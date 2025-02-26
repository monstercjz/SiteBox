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
  DATA_DOCKER_NAME,
  DATA_DESCRIPTION,
  DATA_ITEM_ID,
  TOOLTIP_CONTENT_TEMPLATE,
  DEFAULT_PLACEHOLDER,
  CLASS_WEBSITE_ITEM,
  CLASS_DOCKER_ITEM,
  ICON_BUTTON,
  DATA_DOCKER_URLPORT,
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
    this.targetType = null;
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
    document.addEventListener('mouseleave', this.handleElementLeave.bind(this), true);

    // 绑定 contextmenu 和 click 事件
    document.addEventListener(EVENT_CONTEXTMENU, () => {
      this.cachedContextMenu = document.getElementById(CONTEXT_MENU_ID);
    });
    document.addEventListener('click', () => {
      this.cachedContextMenu = null;
    });
    window.addEventListener('beforeunload', () => this.destroy());

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
    const target = event.target instanceof HTMLElement ? event.target.closest('[data-item-id], [data-tooltip]') : null;
    if (!target) return;

    const relatedTarget = event.relatedTarget;

    if (relatedTarget && target.contains(relatedTarget)) {

      return;
    }

    this.clearElementTimers(target);
    if (this.currentTooltip?.targetElement === target) {
      this._cleanupTooltip(this.currentTooltip);
      this.currentHoverTarget = null;
    }
  }

  // 处理悬停逻辑
  handleItemHover(target, targetType) {

    const itemId = target.dataset.itemId;


    const debounceTimer = setTimeout(() => {
      this._processHoverAction(target, itemId, targetType);
    }, config.debounceDelay);

    this.storeTimer(target, debounceTimer);
    // console.log('计时器', this.activeTimers);
  }

  //不同类型获取不同数据，然后数据提交给显示函数_showTooltip
  async _processHoverAction(target, itemId, targetType) {

    if (!this.isElementValid(target)) return;
    // 如果是 Docker 项
    //  if (this.isDockerItem(target)) {
    //   data = await this._getDockerData(target);
    // } 
    // // 如果是普通网站项
    // else if (itemId) {
    //   data = await this._getWebsiteData(itemId);
    // } 
    // // 如果是按钮或其他带有 data-tooltip 的元素
    // else if (target.hasAttribute('data-tooltip')) {
    //   data = { tooltipContent: target.getAttribute('data-tooltip') };
    // } 
    // // 如果没有任何匹配条件，则直接返回
    // else {
    //   return;
    // }
    this._preloadAdjacentData(target, targetType);
    try {
      // 定义处理逻辑数组
      const handlers = [
        {
          condition: () => targetType === CLASS_DOCKER_ITEM,
          action: async () => await this._getDockerData(target)
        },
        {
          condition: () => targetType === CLASS_WEBSITE_ITEM,
          action: async () => await this._getWebsiteData(itemId)
        },
        {
          condition: () => targetType === ICON_BUTTON,
          action: () => ({ tooltipContent: target.getAttribute('data-tooltip') })
        }
      ];

      // 查找第一个满足条件的处理器
      const handler = handlers.find(h => h.condition());
      if (!handler) return;

      // 执行对应的处理逻辑
      const data = await handler.action();


      if (!this.isElementValid(target)) return;

      this._showTooltip(target, data, targetType);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.errorService.handleWebsiteDataError(target, error);
      }
    }
  }

  isDockerItem(target) {
    return target.classList.contains(CLASS_DOCKER_ITEM);
  }
  isWebsiteItem(target) {
    return target.classList.contains(CLASS_WEBSITE_ITEM);
  }
  isIconButton(target) {
    return (
      target.tagName === 'BUTTON' &&
      (target.classList.contains('icon-button') || target.classList.contains('theme-switcher__option')) &&
      target.hasAttribute('data-tooltip')
    );
  }
  getElementType(target) {
    if (this.isIconButton(target)) {
      return ICON_BUTTON; // 判断是否为按钮
    } else if (this.isDockerItem(target)) {
      return CLASS_DOCKER_ITEM; // 判断是否为 Docker 元素
    } else if (this.isWebsiteItem(target)) {
      return CLASS_WEBSITE_ITEM; // 判断是否为网站元素
    }
    return null; // 如果都不匹配，返回 null
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
    const name = target.getAttribute(DATA_DOCKER_NAME) || DEFAULT_PLACEHOLDER;
    const urlPort = target.getAttribute(DATA_DOCKER_URLPORT) || DEFAULT_PLACEHOLDER;
    const server = target.getAttribute(DATA_DOCKER_SERVER_IP) || DEFAULT_PLACEHOLDER;
    const serverPort = target.getAttribute(DATA_DOCKER_SERVER_PORT) || DEFAULT_PLACEHOLDER;
    const description = target.getAttribute(DATA_DESCRIPTION) || DEFAULT_PLACEHOLDER;
    return {
      name,
      urlPort,
      server,
      serverPort,
      description
    };
  }

  _showTooltip(target, data, targetType) {
    if (!this.isElementValid(target)) return
    if (this._checkContextMenuPresence()) return;
    const tooltip = this.domService.createTooltipElement(targetType);
    if (tooltip.style.display === 'block' && tooltip.targetElement === target) return; // 避免重复显示
    this._removeCurrentTooltip(targetType);
    tooltip.innerHTML = this.generateTooltipContent(target, data, targetType);//把data传给generateTooltipContent
    tooltip.targetElement = target;
    // document.body.appendChild(tooltip);
    this.domService.showTooltip(tooltip);
    requestAnimationFrame(() => {
      this.domService.positionTooltip(tooltip, target, targetType);
      this.currentTooltip = tooltip;
      this.currentitemId = target.dataset.itemId;
    });
    const autoCloseTimer = setTimeout(() => {
      this._cleanupTooltip(tooltip);
    }, config.autoCloseDelay);
    this.storeTimer(target, autoCloseTimer);
  }

  //各自把data数据生成页面内容和样式
  generateTooltipContent(target, data, targetType) {
    // 定义内容生成器数组
    const contentGenerators = [
      // 生成器 1: 处理 Docker 提示
      {
        condition: () => targetType === CLASS_DOCKER_ITEM,
        generator: () => this.generateTooltipContentForDocker(data)
      },

      // 生成器 2: 处理按钮的 data-tooltip 提示
      {
        condition: () => targetType === ICON_BUTTON,
        generator: () => escapeHtml(data.tooltipContent)
      },

      // 生成器 3: 处理网站数据提示
      {
        condition: () => targetType === CLASS_WEBSITE_ITEM,
        generator: () => this.generateTooltipContentForWebsite(data)
      }
    ];

    // 遍历生成器数组，找到第一个匹配的内容
    for (const { condition, generator } of contentGenerators) {
      if (condition()) {
        return generator(); // 返回匹配的内容
      }
    }

    // 如果没有匹配到任何内容，返回默认值
    return '无可用提示内容';
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
      .replace('{{name}}', data.name)
      .replace('{{urlPort}}', data.urlPort)
      .replace('{{server}}', data.server)
      .replace('{{serverPort}}', data.serverPort)
      .replace('{{description}}', data.description);
  }

  _checkContextMenuPresence() {
    return this.cachedContextMenu && document.getElementById(CONTEXT_MENU_ID);
  }

  _removeCurrentTooltip(targetType) {
    if (this.currentTooltip) {
      this.domService.removeCurrentTooltip(targetType);
      this.currentTooltip = null;
      this.currentitemId = null;
    }
  }

  _cleanupTooltip(tooltip) {
    this.domService.cleanupTooltip(tooltip); // 清理 tooltip DOM 元素引用
    this.currentTooltip = null; // 更新 currentTooltip
    if (!this.currentTooltip) { // 确保 currentTooltip 为 null
      this.currentitemId = null;
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
            this._getDockerData(adjacent);
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
      this._getWebsiteData(itemId)
        .then(resolve)
        .catch(error => {
          console.error(`Error processing request for itemId ${itemId}:`, error);
          resolve(null); // 确保 Promise 被解决
        });
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
  destroy() {
    // 移除事件监听器
    document.removeEventListener('mouseleave', this.handleElementLeave.bind(this), true);
    document.removeEventListener(EVENT_CONTEXTMENU, () => {
      this.cachedContextMenu = document.getElementById(CONTEXT_MENU_ID);
    });
    document.removeEventListener('click', () => {
      this.cachedContextMenu = null;
    });
    window.removeEventListener('beforeunload', () => this.destroy());
  
    // 清除定时器
    this.activeTimers.forEach((timers) => timers.forEach(clearTimeout));
    this.activeTimers.clear();
  
    // 取消异步请求
    this.abortControllerMap.forEach((controller) => controller.abort());
    this.abortControllerMap.clear();
    this.pendingRequests.clear();
    this.recentRequests.clear();
  
    // 清理 DOM
    this.domService.destroy();
  
    // 重置状态
    this.currentHoverTarget = null;
    this.currentitemId = null;
    this.targetType = null;
    this.cachedContextMenu = null;
  }
}

// 独立的 handleElementEnter 函数
export function handleElementEnter(event) {
  const tooltipService = UnifiedTooltipService.getInstance(); // 获取单例实例
  const target = event.target.closest('[data-item-id], [data-tooltip]');
  if (!target) return;

  // 获取目标元素的类型
  const targetType = tooltipService.getElementType(target);

  // 如果类型无效，直接返回
  if (!targetType) return;

  // 设置当前悬停的目标元素
  tooltipService.currentHoverTarget = target;
  // 清除与目标元素相关的计时器
  tooltipService.clearElementTimers(target);


  // 调用 handleItemHover 方法，并传递目标元素和类型
  tooltipService.handleItemHover(target, targetType);
}