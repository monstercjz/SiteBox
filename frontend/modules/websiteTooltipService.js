import { getWebsiteById } from './api.js';
import { generateTooltipContent } from './utils.js';
import { TooltipDomService } from './tooltipDomService.js';
import { TooltipCacheService } from './tooltipCacheService.js';
import { TooltipErrorService } from './tooltipErrorService.js'; // 引入 TooltipErrorService

// 配置对象
const config = {
  hoverDelay: 30, // 悬停延迟显示工具提示的时间 (毫秒)
  autoCloseDelay: 5000, // 工具提示自动关闭的延迟时间 (毫秒)
  debounceDelay: 500, // 处理鼠标悬停事件的防抖延迟 (毫秒)
  fadeOutDuration: 150, // 工具提示淡出动画持续时间 (毫秒) // 移至 tooltipDomService 中
  cache: {
    expiration: 1000 * 60 * 10 // 缓存过期时间 (毫秒) // 移至 tooltipCacheService 中
  },
  maxConcurrentRequests: 3, // 最大并发请求数量
  requestMergeThreshold: 300 // 请求合并阈值，单位毫秒，例如 300ms 内的重复请求将被合并
  // cacheDuration: 1000 * 60 * 5, // 5分钟，已移除，统一使用 cache.expiration
}

/**
 * @class WebsiteTooltipService
 * @description 网站工具提示服务，负责处理网站链接悬停时显示工具提示信息
 */
export class WebsiteTooltipService {
  constructor() {
    this.currentWebsiteId = null; // 当前悬停的网站 ID
    this.timeouts = {}; // 存储 timeout 定时器
    this.pendingRequests = new Map(); // 存储正在进行的请求 Promise
    this.domService = new TooltipDomService(); // DOM 操作服务
    this.cacheService = new TooltipCacheService(); // 缓存服务
    this.errorService = new TooltipErrorService(this.domService); // 错误处理服务
    this.concurrentRequestCount = 0; // 当前并发请求数量
    this.requestQueue = []; // 请求队列
    this.abortControllerMap = new Map(); // 用于存储 AbortController 实例
    this.recentRequests = new Map(); // 用于存储最近完成的请求及其时间戳，实现请求合并

    // 使用事件委托处理鼠标移出事件，避免为每个 tooltip 元素绑定事件监听器
    document.body.addEventListener('mouseout', (e) => {
      if (this.currentTooltip && !this.currentTooltip.contains(e.relatedTarget)) {
        const relatedTargetWebsiteId = e.relatedTarget?.dataset?.websiteId;
        // 鼠标移出 tooltip 且移出的目标不是同个网站链接，则清除 tooltip
        if (relatedTargetWebsiteId !== this.currentWebsiteId) {
          this._clearTimeouts();
          this._cleanupTooltip(this.currentTooltip);
        }
      }
    });
  }

  /**
   * @method handleWebsiteHover
   * @description 处理网站链接悬停事件
   * @param {HTMLElement} target 悬停的目标元素
   */
  async handleWebsiteHover(target) {
    if (!target?.dataset?.websiteId) return;

    const websiteId = target.dataset.websiteId;
    
    this._clearTimeouts(); // 清除所有 timeout 定时器和未完成请求
    this._preloadAdjacentData(target); // 预加载相邻网站数据

    // 使用 debounceDelay 防抖延迟处理鼠标悬停事件，避免频繁触发
    this.timeouts.debounce = setTimeout(() => {
      this._handleHoverDebounced(target, websiteId);
    }, config.debounceDelay);
  }

  /**
   * @method _clearTimeouts
   * @description 清除所有 timeout 定时器和未完成请求
   * @private
   */
  _clearTimeouts() {
    Object.values(this.timeouts).forEach(timeout => clearTimeout(timeout));
    this.timeouts = {};
    // 取消所有未完成的请求
    this.abortControllerMap.forEach(controller => controller.abort());
    this.abortControllerMap.clear();
  }

  /**
   * @method _handleHoverDebounced
   * @description 防抖处理鼠标悬停事件
   * @param {HTMLElement} target 悬停的目标元素
   * @param {string} websiteId 网站 ID
   * @private
   */
  async _handleHoverDebounced(target, websiteId) {
    // 使用 hoverDelay 延迟显示 tooltip，避免快速悬停导致 tooltip 闪烁
    this.timeouts.hover = setTimeout(async () => {
      try {
        const website = await this._getWebsiteData(websiteId);
        if (website) {
          this._showTooltip(target, website);
        }
      } catch (error) {
        // 错误处理移至 tooltipErrorService
        this.errorService.handleWebsiteDataError(target, error);
      }
    }, config.hoverDelay);

  }

  /**
   * @method _getWebsiteData
   * @description 获取网站数据，优先从缓存中获取，如果缓存不存在则从 API 获取
   * @param {string} websiteId 网站 ID
   * @returns {Promise<Website>} 网站数据 Promise
   * @private
   */
  async _getWebsiteData(websiteId) {
    // 检查是否有正在进行的请求，避免重复请求
    if (this.pendingRequests.has(websiteId)) {
      return this.pendingRequests.get(websiteId);
    }

    // 尝试从缓存中获取数据
    const cachedData = this.cacheService.getCachedData(websiteId);
    if (cachedData) {
      return cachedData;
    }

    // 检查最近是否有相同 websiteId 的请求，如果存在且在合并阈值内，则直接返回之前的请求 Promise，实现请求合并
    if (this.recentRequests.has(websiteId)) {
      const recentRequest = this.recentRequests.get(websiteId);
      if (Date.now() - recentRequest.timestamp < config.requestMergeThreshold) {
        console.log('合并请求:', websiteId);
        return recentRequest.promise; // 直接返回最近请求的 Promise
      }
    }

    // 检查并发请求数量是否已达上限，如果已达上限则加入请求队列
    if (this.concurrentRequestCount >= config.maxConcurrentRequests) {
      // 加入请求队列，等待执行
      return new Promise(resolve => {
        this.requestQueue.push({ websiteId, resolve });
      });
    }

    // 增加并发请求计数器
    this.concurrentRequestCount++;

    // 创建 AbortController 实例，用于取消请求
    const abortController = new AbortController();
    this.abortControllerMap.set(websiteId, abortController);
    const signal = abortController.signal;

    // 发起 API 请求获取网站数据
    const requestPromise = getWebsiteById(websiteId, signal) // 传递 AbortSignal，支持取消请求
      .then(website => {
        if (!website || !website.url) {
          throw new Error('Invalid website data');
        }
        // 缓存数据
        this.cacheService.setCacheData(websiteId, website);
        return website;
      })
      .catch(error => {
        // 错误处理移至 tooltipErrorService
        if (error.name === 'AbortError') {
          // 请求被取消，不处理错误，返回 null
          console.log('Request aborted:', websiteId);
          return null; // 返回 null，避免影响后续处理
        }
        throw error; // 其他错误继续抛出，由 _handleHoverDebounced 统一处理
      })
      .finally(() => {
        // 请求完成后，从 pendingRequests 中移除
        this.pendingRequests.delete(websiteId);
        // 减少并发请求计数器
        this.concurrentRequestCount--;
        // 从 abortControllerMap 中移除
        this.abortControllerMap.delete(websiteId);
        // 处理请求队列，执行下一个请求
        this._processRequestQueue();
      });

    // 将本次请求添加到 recentRequests Map 中，用于请求合并
    this.recentRequests.set(websiteId, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    return requestPromise;
  }

  /**
   * @method _processRequestQueue
   * @description 处理请求队列，执行队列中的请求
   * @private
   */
  _processRequestQueue() {
    // 检查请求队列和并发请求数量，如果队列不为空且并发请求数量未达上限，则执行队列中的请求
    if (this.requestQueue.length > 0 && this.concurrentRequestCount < config.maxConcurrentRequests) {
      // 从请求队列中取出第一个请求
      const request = this.requestQueue.shift();
      // 立即执行请求
      this._getWebsiteData(request.websiteId).then(request.resolve);
    }
  }

  /**
   * @method _preloadAdjacentData
   * @description 预加载相邻网站数据，提升用户体验
   * @param {HTMLElement} target 悬停的目标元素
   * @private
   */
  _preloadAdjacentData(target) {
    const allTargets = Array.from(document.querySelectorAll('[data-website-id]'));
    const currentIndex = allTargets.indexOf(target);

    // 预加载相邻的两个网站数据
    const adjacentIndexes = [currentIndex - 1, currentIndex + 1];
    adjacentIndexes.forEach(index => {
      if (index >= 0 && index < allTargets.length) {
        const adjacentTarget = allTargets[index];
        const adjacentWebsiteId = adjacentTarget.dataset.websiteId;
        // 预加载时也检查缓存和正在进行的请求，避免重复加载
        if (!this.cacheService.getCachedData(adjacentWebsiteId) && !this.pendingRequests.has(adjacentWebsiteId)) {
          this._getWebsiteData(adjacentWebsiteId);
        }
      }
    });
  }


  /**
   * @method _showTooltip
   * @description 显示工具提示
   * @param {HTMLElement} target 悬停的目标元素
   * @param {Website} website 网站数据
   * @private
   */
  _showTooltip(target, website) {
    const websiteId = target.dataset.websiteId;
    // 如果当前 tooltip 正在显示且网站 ID 相同，则不重复显示
    if (this.currentWebsiteId === websiteId) return;

    this._removeCurrentTooltip(); // 移除当前 tooltip
    this._createTooltip(target, website, websiteId); // 创建并显示新的 tooltip
  }

  /**
   * @method _removeCurrentTooltip
   * @description 移除当前工具提示
   * @private
   */
  _removeCurrentTooltip() {
    this.domService.removeCurrentTooltip();
    this.currentTooltip = this.domService.getCurrentTooltip(); // 更新 currentTooltip
    if (!this.currentTooltip) { // 确保 currentTooltip 为 null
      this.currentWebsiteId = null;
    }
  }

  /**
   * @method _createTooltip
   * @description 创建并显示工具提示
   * @param {HTMLElement} target 悬停的目标元素
   * @param {Website} website 网站数据
   * @param {string} websiteId 网站 ID
   * @private
   */
  _createTooltip(target, website, websiteId) {
    requestAnimationFrame(() => { // 使用 requestAnimationFrame 批量更新 DOM
      const tooltip = this.domService.createTooltipElement(); // 创建 tooltip 元素 (复用)
      tooltip.innerHTML = generateTooltipContent(website); // 生成 tooltip 内容
      this.domService.positionTooltip(tooltip, target); // 定位 tooltip
      document.body.appendChild(tooltip); // 将 tooltip 添加到 DOM 中
      this.domService.showTooltip(tooltip); // 显示 tooltip

      this.domService.setCurrentTooltip(tooltip); // 设置 domService 的 currentTooltip
      this.currentTooltip = tooltip; // 更新 websiteTooltipService 的 currentTooltip
      this.currentWebsiteId = websiteId; // 更新当前悬停的网站 ID

      this._setupAutoClose(tooltip, target); // 设置自动关闭 tooltip
    });
  }

  /**
   * @method _showErrorTooltip
   * @description 显示错误工具提示
   * @param {HTMLElement} target 悬停的目标元素
   * @param {Error} error 错误对象
   * @private
   */
  _showErrorTooltip(target, error) {
    this.errorService.handleWebsiteDataError(target, error); // 使用 errorService 显示错误提示
  }


  /**
   * @method _setupAutoClose
   * @description 设置工具提示自动关闭
   * @param {HTMLElement} tooltip 工具提示元素
   * @param {HTMLElement} target 悬停的目标元素
   * @private
   */
  _setupAutoClose(tooltip, target) {
    this.timeouts.autoClose = setTimeout(() => {
      this._cleanupTooltip(tooltip);
    }, config.autoCloseDelay);
  }


  /**
   * @method _cleanupTooltip
   * @description 清理工具提示
   * @param {HTMLElement} tooltip 工具提示元素
   * @private
   */
  _cleanupTooltip(tooltip) {
    this.domService.cleanupTooltip(tooltip); // 清理 tooltip DOM 元素
    this.currentTooltip = this.domService.getCurrentTooltip(); // 更新 currentTooltip
    if (!this.currentTooltip) { // 确保 currentTooltip 为 null
      this.currentWebsiteId = null;
    }
  }
}