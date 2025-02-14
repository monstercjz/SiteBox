

// frontend/modules/DockerTooltipService.js
import { TooltipDomService } from './tooltipDomService.js';
import { TooltipCacheService } from './tooltipCacheService.js';
import { TooltipErrorService } from './tooltipErrorService.js';

// 配置对象 (可以根据需要调整)
const config = {
  hoverDelay: 30,
  autoCloseDelay: 5000,
  debounceDelay: 500,
  cache: {
    expiration: 1000 * 60 * 10
  },
  maxConcurrentRequests: 3,
  requestMergeThreshold: 300
};

export class DockerTooltipService {
  constructor() {
    this.currentDockerId = null;
    this.timeouts = {};
    this.pendingRequests = new Map();
    this.domService = new TooltipDomService();
    this.cacheService = new TooltipCacheService();
    this.errorService = new TooltipErrorService(this.domService);
    this.concurrentRequestCount = 0;
    this.requestQueue = [];
    this.abortControllerMap = new Map();
    this.recentRequests = new Map();

    document.body.addEventListener('mouseout', (e) => {
      if (this.currentTooltip && !this.currentTooltip.contains(e.relatedTarget)) {
        const relatedTargetDockerId = e.relatedTarget?.dataset?.dockerId;
        if (relatedTargetDockerId !== this.currentDockerId) {
          this._clearTimeouts();
          this._cleanupTooltip(this.currentTooltip);
        }
      }
    });
  }

  async handleDockerHover(target) {
    if (!target?.dataset?.dockerId) return;

    const dockerId = target.dataset.dockerId;

    this._clearTimeouts();
    // this._preloadAdjacentData(target); // (暂不实现预加载)

    this.timeouts.debounce = setTimeout(() => {
      this._handleHoverDebounced(target, dockerId);
    }, config.debounceDelay);
  }

  _clearTimeouts() {
    Object.values(this.timeouts).forEach(timeout => clearTimeout(timeout));
    this.timeouts = {};
    this.abortControllerMap.forEach(controller => controller.abort());
    this.abortControllerMap.clear();
  }

  async _handleHoverDebounced(target, dockerId) {
    this.timeouts.hover = setTimeout(async () => {
      try {
        // const docker = await this._getDockerData(dockerId); // (暂不实现数据获取)
        const docker = { // 模拟 Docker 数据
          urlPort: '8080',
          server: 'localhost',
          serverPort: '9000'
        };
        if (docker) {
          this._showTooltip(target, docker);
        }
      } catch (error) {
        this.errorService.handleDockerDataError(target, error); // (暂未实现 errorService 中的 docker error 处理)
      }
    }, config.hoverDelay);
  }

  _processRequestQueue() {
    if (this.requestQueue.length > 0 && this.concurrentRequestCount < config.maxConcurrentRequests) {
      const request = this.requestQueue.shift();
      // this._getDockerData(request.dockerId).then(request.resolve); // (暂不实现数据获取)
    }
  }

  _showTooltip(target, docker) {
    const dockerId = target.dataset.dockerId;
    if (this.currentDockerId === dockerId) return;

    this._removeCurrentTooltip();
    this._createTooltip(target, docker, dockerId);
  }

  _removeCurrentTooltip() {
    this.domService.removeCurrentTooltip();
    this.currentTooltip = this.domService.getCurrentTooltip();
    if (!this.currentTooltip) {
      this.currentDockerId = null;
    }
  }

  _createTooltip(target, docker, dockerId) {
    const tooltip = this.domService.createTooltipElement();
    tooltip.innerHTML = this.generateTooltipContentForDocker(target); // 使用新的内容生成方法
    tooltip.targetElement = target; // 保存目标元素引用
    document.body.appendChild(tooltip);
    this.domService.showTooltip(tooltip);

    // 确保 tooltip 元素已经添加到 DOM 中并显示后再进行定位
    requestAnimationFrame(() => {
      this.domService.positionTooltip(tooltip, tooltip.targetElement);
      this.domService.setCurrentTooltip(tooltip);
      this.currentTooltip = tooltip;
      this.currentDockerId = dockerId;

      this._setupAutoClose(tooltip, target);
    });
  }

  _setupAutoClose(tooltip, target) {
    this.timeouts.autoClose = setTimeout(() => {
      this._cleanupTooltip(tooltip);
    }, config.autoCloseDelay);
  }

  _cleanupTooltip(tooltip) {
    this.domService.cleanupTooltip(tooltip);
    this.currentTooltip = this.domService.getCurrentTooltip();
    if (!this.currentTooltip) {
      this.currentDockerId = null;
    }
  }

  // 新的工具提示内容生成方法
  generateTooltipContentForDocker(target) {
    const urlPort = target.getAttribute('data-docker-server-port');
    const server = target.getAttribute('data-docker-server-ip');
    const serverPort = target.getAttribute('data-docker-server-port');
    return `
      <div class="docker-tooltip">
        <p>URL Port: ${urlPort || 'N/A'}</p>
        <p>Server: ${server || 'N/A'}</p>
        <p>Server Port: ${serverPort || 'N/A'}</p>
      </div>
    `;
  }
}