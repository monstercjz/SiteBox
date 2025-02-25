

// tooltipDomService.js - 负责 tooltip 的 DOM 操作

/**
 * @class TooltipDomService
 * @description Tooltip DOM 操作服务，负责 tooltip 元素的创建、显示、隐藏和移除等 DOM 操作
 */
export class TooltipDomService {
  constructor() {
    
    this.tooltipInstance = null; // 用于复用 tooltip 元素实例
    this.buttontooltipInstance = null; // 用于复用 tooltip 元素实例
  }

  /**
   * @method createTooltipElement
   * @description 创建 tooltip 元素，如果 tooltip 元素实例已存在则复用，否则创建新的元素
   * @returns {HTMLElement} tooltip 元素
   */
  createTooltipElement(targetType) {
    if (targetType === 'icon-button') {
      if (!this.buttontooltipInstance) {
        // 如果 tooltip 元素实例不存在，则创建新的元素
        this.buttontooltipInstance = document.createElement('div');
        document.body.appendChild(this.buttontooltipInstance);
          this.buttontooltipInstance.className = 'button-tooltip fade-in'; // 添加 fade-in 动画类
        
        
      }
      return this.buttontooltipInstance; // 返回 tooltip 元素实例
    }else {
      if (!this.tooltipInstance) {
        // 如果 tooltip 元素实例不存在，则创建新的元素
        this.tooltipInstance = document.createElement('div');
        document.body.appendChild(this.tooltipInstance);
          this.tooltipInstance.className = 'item-tooltip fade-in'; // 添加 fade-in 动画类
        
        
      }
      return this.tooltipInstance; // 返回 tooltip 元素实例

      }
  }

  /**
   * @method positionTooltip
   * @description 定位 tooltip 元素到目标元素下方
   * @param {HTMLElement} tooltip tooltip 元素
   * @param {HTMLElement} target 目标元素
   */
  positionTooltip(tooltip, target,targetType) {
    
  
    if (targetType === 'icon-button') {
      this.positionButtonTooltip(tooltip, target); // 调用按钮专用的位置处理函数
    } else {
      this.positionDefaultTooltip(tooltip, target); // 调用默认的位置处理函数
    }
  }
  positionDefaultTooltip(tooltip, target) {
    
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
  positionButtonTooltip(tooltip, target) {
    
    const rect = target.getBoundingClientRect(); // 获取目标元素 Rect
    const tooltipRect = tooltip.getBoundingClientRect(); // 获取工具提示 Rect
  
    const windowHeight = window.innerHeight; // 获取窗口高度
    const windowWidth = window.innerWidth; // 获取窗口宽度
  
    // 设置绝对定位
    tooltip.style.position = 'absolute';
  
    // 默认位置：工具提示显示在按钮的左侧
    let left = rect.left - tooltipRect.width - 10; // 左侧留出 10px 的间距
    let top = rect.top + (rect.height - tooltipRect.height) / 2 + window.scrollY; // 垂直居中对齐
  
    // 检查工具提示是否超出页面左侧
    if (left < 0) {
      // 如果超出左侧，则改为显示在右侧
      left = rect.right + 10; // 右侧留出 10px 的间距
    }
  
    // 检查工具提示是否超出页面顶部或底部
    if (top < 0) {
      // 如果超出顶部，则向下调整
      top = rect.top + window.scrollY;
    } else if (top + tooltipRect.height > windowHeight) {
      // 如果超出底部，则向上调整
      top = rect.bottom - tooltipRect.height + window.scrollY - 10; // 留出 10px 的间距
    }
  
    // 设置工具提示的位置
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }
  /**
   * @method removeCurrentTooltip
   * @description 移除当前显示的 tooltip 元素，使用 fade-out 动画效果
   */
  // 移除当前 tooltip 的淡出效果，基于 targetType 操作对应的实例
  removeCurrentTooltip(targetType) {
    const tooltip = targetType === 'icon-button' ? this.buttontooltipInstance : this.tooltipInstance;
    if (tooltip && tooltip.style.display === 'block') {
      tooltip.classList.add('fade-out');
      setTimeout(() => {
        this.hideTooltip(tooltip);
        tooltip.classList.remove('fade-out'); // 清理动画类以便下次使用
      }, 150); // 与 fade-out 动画时长一致
    }
  }
  /**
   * @method cleanupTooltip
   * @description 清理 tooltip 元素，隐藏 tooltip
   * @param {HTMLElement} tooltip tooltip 元素
   */
  // 清理 tooltip，仅隐藏
  cleanupTooltip(tooltip) {
    if (tooltip && tooltip.style.display === 'block') {
      this.hideTooltip(tooltip);
    }
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
  destroy() {
    this.hide();
    if (this.tooltipInstance) {
      this.tooltipInstance.remove();
    }
    if (this.buttontooltipInstance) {
      this.buttontooltipInstance.remove();
    }
  }
}