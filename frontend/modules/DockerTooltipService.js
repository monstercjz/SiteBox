import { TooltipDomService } from './tooltipDomService.js';
import { TooltipCacheService } from './tooltipCacheService.js';
import { TooltipErrorService } from './tooltipErrorService.js';
import {
    CLASS_DOCKER_TOOLTIP,
    DATA_DOCKER_SERVER_PORT,
    DATA_DOCKER_SERVER_IP,
    DATA_DESCRIPTION,
    DATA_ITEM_ID,
    TOOLTIP_CONTENT_TEMPLATE,
    DEFAULT_PLACEHOLDER,
    CONFIG_HOVER_DELAY,
    CONFIG_AUTO_CLOSE_DELAY,
    CONFIG_DEBOUNCE_DELAY,
    CONTEXT_MENU_ID, 
    EVENT_CONTEXTMENU,
} from '../config.js';

// 配置对象 (可以根据需要调整)
const config = {
    [CONFIG_HOVER_DELAY]: 30,
    [CONFIG_AUTO_CLOSE_DELAY]: 5000,
    [CONFIG_DEBOUNCE_DELAY]: 500,
    cache: {
        expiration: 1000 * 60 * 10,
    },
    maxConcurrentRequests: 3,
    requestMergeThreshold: 300,
};

export class DockerTooltipService {
    constructor() {
        this.currentitemId = null;
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
                const relatedTargetitemId = e.relatedTarget?.dataset?.itemId;
                if (relatedTargetitemId !== this.currentitemId) {
                    this._clearTimeouts();
                    this._cleanupTooltip(this.currentTooltip);
                }
            }
        });
        document.addEventListener(EVENT_CONTEXTMENU, () => {
            this.cachedContextMenu = document.getElementById(CONTEXT_MENU_ID);
        });
    
        // 监听点击事件以隐藏 contextMenu
        document.addEventListener('click', () => {
            this.cachedContextMenu = null;
        });
    }

    async handleDockerHover(target) {
        if (!target?.dataset?.itemId) return;
        const itemId = target.dataset.itemId;
        this._clearTimeouts();
        this.timeouts.debounce = setTimeout(() => {
            this._handleHoverDebounced(target, itemId);
        }, config[CONFIG_DEBOUNCE_DELAY]);
    }

    _clearTimeouts() {
        Object.values(this.timeouts).forEach(timeout => clearTimeout(timeout));
        this.timeouts = {};
        this.abortControllerMap.forEach(controller => controller.abort());
        this.abortControllerMap.clear();
    }

    async _handleHoverDebounced(target, itemId) {
        this.timeouts.hover = setTimeout(async () => {
            try {
                // const docker = await this._getDockerData(itemId); // (暂不实现数据获取)
                const docker = { // 模拟 Docker 数据
                    urlPort: '8080',
                    server: 'localhost',
                    serverPort: '9000',
                };
                if (docker) {
                    this._showTooltip(target, docker);
                }
            } catch (error) {
                this.errorService.handleDockerDataError(target, error); // (暂未实现 errorService 中的 docker error 处理)
            }
        }, config[CONFIG_HOVER_DELAY]);
    }

    _processRequestQueue() {
        if (this.requestQueue.length > 0 && this.concurrentRequestCount < config.maxConcurrentRequests) {
            const request = this.requestQueue.shift();
            // this._getDockerData(request.itemId).then(request.resolve); // (暂不实现数据获取)
        }
    }

    _showTooltip(target, docker) {
        if (this._checkContextMenuPresence()) {
            console.log('ContextMenu is present, skipping tooltip display.');
            return;
        }
        const itemId = target.dataset.itemId;
        if (this.currentitemId === itemId) return;
        this._removeCurrentTooltip();
        this._createTooltip(target, docker, itemId);
    }
    _checkContextMenuPresence() {
        // 如果缓存中不存在 contextMenu，则直接返回 false
        if (!this.cachedContextMenu) {
            return false;
        }
    
        // 如果缓存中存在 contextMenu，则进行一次实时判断
        return !!document.getElementById(CONTEXT_MENU_ID);
    }
    _removeCurrentTooltip() {
        this.domService.removeCurrentTooltip();
        this.currentTooltip = this.domService.getCurrentTooltip();
        if (!this.currentTooltip) {
            this.currentitemId = null;
        }
    }

    _createTooltip(target, docker, itemId) {
        const tooltip = this.domService.createTooltipElement();
        tooltip.innerHTML = this.generateTooltipContentForDocker(target); // 使用新的内容生成方法
        tooltip.targetElement = target; // 保存目标元素引用
        // console.log("tooltip", tooltip.targetElement);
        document.body.appendChild(tooltip);
        this.domService.showTooltip(tooltip);

        // 确保 tooltip 元素已经添加到 DOM 中并显示后再进行定位
        requestAnimationFrame(() => {
            this.domService.positionTooltip(tooltip, tooltip.targetElement);
            this.domService.setCurrentTooltip(tooltip);
            this.currentTooltip = tooltip;
            this.currentitemId = itemId;
            this._setupAutoClose(tooltip, target);
        });
    }

    _setupAutoClose(tooltip, target) {
        this.timeouts.autoClose = setTimeout(() => {
            this._cleanupTooltip(tooltip);
        }, config[CONFIG_AUTO_CLOSE_DELAY]);
    }

    _cleanupTooltip(tooltip) {
        this.domService.cleanupTooltip(tooltip);
        this.currentTooltip = this.domService.getCurrentTooltip();
        if (!this.currentTooltip) {
            this.currentitemId = null;
        }
    }

    // 新的工具提示内容生成方法
    generateTooltipContentForDocker(target) {
        const urlPort = target.getAttribute(DATA_DOCKER_SERVER_PORT) || DEFAULT_PLACEHOLDER;
        const server = target.getAttribute(DATA_DOCKER_SERVER_IP) || DEFAULT_PLACEHOLDER;
        const serverPort = target.getAttribute(DATA_DOCKER_SERVER_PORT) || DEFAULT_PLACEHOLDER;
        const description = target.getAttribute(DATA_DESCRIPTION) || DEFAULT_PLACEHOLDER;

        return TOOLTIP_CONTENT_TEMPLATE
            .replace('{{urlPort}}', urlPort)
            .replace('{{server}}', server)
            .replace('{{serverPort}}', serverPort)
            .replace('{{description}}', description);
    }
}