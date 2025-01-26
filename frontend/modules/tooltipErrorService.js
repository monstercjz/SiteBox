// tooltipErrorService.js - 负责 tooltip 的错误处理

import { TooltipDomService } from './tooltipDomService.js'; // 引入 TooltipDomService

/**
 * @class TooltipErrorService
 * @description Tooltip 错误处理服务，负责处理 tooltip 相关的错误，例如 API 请求失败、数据解析错误等
 */
export class TooltipErrorService {
  constructor(domService) {
    this.domService = domService; // 依赖注入 TooltipDomService，用于显示错误提示 tooltip
  }

  /**
   * @method handleWebsiteDataError
   * @description 处理网站数据加载错误
   * @param {HTMLElement} target 悬停的目标元素
   * @param {Error} error 错误对象
   */
  handleWebsiteDataError(target, error) {
    console.error('Failed to get website details:', error); // 打印错误日志到控制台
    let errorMessage = '加载失败: '; // 默认错误提示信息
    if (error instanceof Error) {
      errorMessage += error.message; // 如果是 Error 对象，则获取错误 message
    } else {
      errorMessage += '未知错误'; // 未知错误类型，显示通用错误提示
    }
    this.domService.showErrorTooltip(target, errorMessage); // 使用 TooltipDomService 显示错误提示 tooltip，并显示更友好的错误信息
  }
}