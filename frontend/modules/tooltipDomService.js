

// tooltipDomService.js - 负责 tooltip 的 DOM 操作

/**
 * @class TooltipDomService
 * @description Tooltip DOM 操作服务，负责 tooltip 元素的创建、显示、隐藏和移除等 DOM 操作
 */
export class TooltipDomService {
  constructor() {
    this.currentTooltip = null; // 当前显示的 tooltip 元素
    this.tooltipInstance = null; // 用于复用 tooltip 元素实例
  }

  /**
   * @method createTooltipElement
   * @description 创建 tooltip 元素，如果 tooltip 元素实例已存在则复用，否则创建新的元素
   * @returns {HTMLElement} tooltip 元素
   */
  createTooltipElement() {
    if (!this.tooltipInstance) {
      // 如果 tooltip 元素实例不存在，则创建新的元素
      this.tooltipInstance = document.createElement('div');
      this.tooltipInstance.className = 'website-tooltip fade-in'; // 添加 fade-in 动画类
    }
    return this.tooltipInstance; // 返回 tooltip 元素实例
  }

  /**
   * @method positionTooltip
   * @description 定位 tooltip 元素到目标元素下方
   * @param {HTMLElement} tooltip tooltip 元素
   * @param {HTMLElement} target 目标元素
   */
  positionTooltip(tooltip, target) {
    const rect = target.getBoundingClientRect(); // 获取目标元素 Rect
    const tooltipRect = tooltip.getBoundingClientRect(); // 获取工具提示 Rect
    // console.log(tooltipRect);
    const windowHeight = window.innerHeight; // 获取窗口高度
    const windowWidth = window.innerWidth; // 获取窗口宽度

    // 设置绝对定位
    tooltip.style.position = 'absolute';

    // 计算工具提示的初始位置
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    // 检查工具提示是否超出页面底部
    if (top + tooltipRect.height > windowHeight) {
        // 如果超出底部，则向上显示
        top = rect.top + window.scrollY - tooltipRect.height - 5;
    }

    // 检查工具提示是否超出页面右侧
    if (left + tooltipRect.width > windowWidth) {
        // 如果超出右侧，则向左对齐
        left = windowWidth - tooltipRect.width - 10; // 留一些边距
    }

    // 设置工具提示的位置
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * @method removeCurrentTooltip
   * @description 移除当前显示的 tooltip 元素，使用 fade-out 动画效果
   */
  removeCurrentTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.classList.add('fade-out'); // 添加 fade-out 动画类
      this.hideTooltip(this.currentTooltip); // 隐藏 tooltip，而不是立即移除，等待 fade-out 动画结束
      this.currentTooltip = null; // 清空 currentTooltip 引用
    }
  }

  /**
   * @method cleanupTooltip
   * @description 清理 tooltip 元素，隐藏 tooltip
   * @param {HTMLElement} tooltip tooltip 元素
   */
  cleanupTooltip(tooltip) {
    if (tooltip) {
      this.hideTooltip(tooltip); // 隐藏 tooltip
    }
    this.currentTooltip = null; // 清空 currentTooltip 引用
  }

  /**
   * @method showErrorTooltip
   * @description 显示错误 tooltip 元素
   * @param {HTMLElement} target 目标元素
   * @param {Error} error 错误对象
   */
  showErrorTooltip(target, error) {
    const errorTooltip = this.createTooltipElement(); // 创建 tooltip 元素 (复用)
    errorTooltip.innerHTML = `<div class="tooltip-content error">加载失败: ${error.message}</div>`; // 设置错误提示内容
    this.positionTooltip(errorTooltip, target); // 定位 tooltip
    document.body.appendChild(errorTooltip); // 将 tooltip 添加到 DOM 中
    this.showTooltip(errorTooltip); // 显示 tooltip
    setTimeout(() => this.hideTooltip(errorTooltip), 2000); // 错误提示显示一段时间后自动隐藏
  }

  /**
   * @method setCurrentTooltip
   * @description 设置当前显示的 tooltip 元素
   * @param {HTMLElement} tooltip tooltip 元素
   */
  setCurrentTooltip(tooltip) {
    this.currentTooltip = tooltip;
  }

  /**
   * @method getCurrentTooltip
   * @description 获取当前显示的 tooltip 元素
   * @returns {HTMLElement} 当前显示的 tooltip 元素
   */
  getCurrentTooltip() {
    return this.currentTooltip;
  }

  /**
   * @method showTooltip
   * @description 显示 tooltip 元素
   * @param {HTMLElement} tooltip tooltip 元素
   */
  showTooltip(tooltip) {
    tooltip.style.display = 'block'; // 设置 display: block 显示 tooltip
  }

  /**
   * @method hideTooltip
   * @description 隐藏 tooltip 元素
   * @param {HTMLElement} tooltip tooltip 元素
   */
  hideTooltip(tooltip) {
    tooltip.style.display = 'none'; // 设置 display: none 隐藏 tooltip
  }
}