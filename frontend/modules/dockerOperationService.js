import modalInteractionService from './modalInteractionService.js';
import { fetchAndRenderGroupSelect } from './groupSelectDataService.js';
import { getWebsiteGroups, createWebsiteGroup } from './api.js';
import { showNotification } from './utils.js';
import { validateAndCompleteUrl } from './utils.js';
import {
    DOCKER_MODAL_ID,
    INPUT_ID_DOCKER_NAME,
    INPUT_ID_ACCESS_IP,
    INPUT_ID_ACCESS_PORT,
    INPUT_ID_DOCKER_API_ADDRESS,
    INPUT_ID_DOCKER_API_PORT,
    INPUT_ID_DOCKER_DESCRIPTION,
    SELECT_ID_GROUP_SELECT,
    DATA_ITEM_ID,
    DATA_DOCKER_SERVER_IP,
    DATA_DOCKER_SERVER_PORT,
    DATA_DESCRIPTION,
    DATA_GROUP_ID,
    MODAL_TITLE_EDIT_DOCKER,
    MODAL_TITLE_ADD_DOCKER,
    BUTTON_CLASS_SAVE,
    BUTTON_CLASS_CANCEL,
    ARIA_LABEL_CLOSE_MODAL,
    ARIA_LABEL_SAVE,
    ARIA_LABEL_CANCEL,
    CLASS_DOCKER_ITEM,
    INPUT_ID_DOCKER_DISPLAY_NAME,
    DATA_DOCKER_NAME,
} from '../config.js';

export class DockerOperationService {
    constructor() {
        this.currentWebsiteId = null;
        this.callback = null;
        this.modalId = DOCKER_MODAL_ID; // 使用常量
    }

    /**
     * 清理实例状态
     */
    cleanup() {
        this.currentWebsiteId = null;
        this.callback = null;
    }

    /**
     * 打开 Docker 操作模态框
     * @param {object} options - 配置选项
     * @param {string} options.dockerId - Docker 容器 ID
     * @param {'edit'|'add'} options.mode - 操作模式
     * @param {function} options.callback - 保存回调函数
     * @param {string} options.groupId - 分组 ID
     * @throws {Error} 如果参数无效或操作失败
     */
    async openDockerModal(options) {
        if (document.getElementById(this.modalId)) {
                    modalInteractionService.closeModal(this.modalId);
                    return;
        }
        try {
            const { dockerId, mode, callback, groupId } = options;

            if (dockerId && typeof dockerId !== 'string') {
                throw new Error('dockerId must be a string when provided');
            }
            if (!['edit', 'add'].includes(mode)) {
                throw new Error('Invalid mode');
            }
            if (typeof callback !== 'function') {
                throw new Error('Invalid callback');
            }
            if (mode === 'add' && dockerId) {
                throw new Error('dockerId should be empty in add mode');
            }

            this.currentWebsiteId = dockerId;
            this.callback = callback;
            let validatedGroupId = groupId;

            await this.setupWebsiteModal(mode, dockerId, validatedGroupId);
        } catch (error) {
            console.error('Failed to open website modal:', error);
            this.cleanup();
            throw error;
        }
    }

    /**
     * 设置并打开 Docker 模态框
     * @param {'edit'|'add'} mode - 操作模式
     * @param {string} dockerId - Docker 容器 ID
     * @param {string} groupId - 分组 ID
     */
    async setupWebsiteModal(mode, dockerId, groupId) {
        const modalContent = this.createModalContent(mode);
        modalInteractionService.createModal(this.modalId, modalContent);

        const groupSelect = document.getElementById(SELECT_ID_GROUP_SELECT);
        if (groupSelect) {
            await fetchAndRenderGroupSelect('docker');
        }

        if (mode === 'edit') {
            this.setupEditDockerModalData(this.modalId, dockerId, groupId);
        }
        if (mode === 'add' && groupId) {
            this.setupAddDockerModalData(this.modalId, groupId);
        }
        modalInteractionService.openModal(this.modalId, {
            onSave: async (modal) => {
                try {
                    const dockerName = modal.querySelector(`#${INPUT_ID_DOCKER_NAME}`).value;
                    const dockerDisplayName = modal.querySelector(`#${INPUT_ID_DOCKER_DISPLAY_NAME}`).value;
                    const accessIp = modal.querySelector(`#${INPUT_ID_ACCESS_IP}`).value;
                    const accessPort = modal.querySelector(`#${INPUT_ID_ACCESS_PORT}`).value;
                    const dockerApiAddress = modal.querySelector(`#${INPUT_ID_DOCKER_API_ADDRESS}`).value;
                    const dockerApiPort = modal.querySelector(`#${INPUT_ID_DOCKER_API_PORT}`).value;
                    const dockerDescription = modal.querySelector(`#${INPUT_ID_DOCKER_DESCRIPTION}`).value;
                    const groupSelectValue = modal.querySelector(`#${SELECT_ID_GROUP_SELECT}`).value;

                    if (this.callback) {
                        const newAccessIp = validateAndCompleteUrl(accessIp);
                        
                        await this.callback({
                            dockerName,
                            dockerDisplayName,
                            newAccessIp,
                            accessPort,
                            dockerApiAddress,
                            dockerApiPort,
                            dockerDescription,
                            groupSelect: groupSelectValue,
                        });
                    }
                } catch (error) {
                    console.error('Failed to save docker:', error);
                    throw error;
                } finally {
                    modalInteractionService.closeModal(this.modalId);
                    this.cleanup();
                }
            },
            onCancel: () => {
                modalInteractionService.closeModal(this.modalId);
                this.cleanup();
            },
        });
    }

    /**
     * 创建模态框内容
     * @param {'edit'|'add'} mode - 操作模式
     * @returns {string} - 模态框的 HTML 内容
     */
    createModalContent(mode) {
        const title = mode === 'edit' ? MODAL_TITLE_EDIT_DOCKER : MODAL_TITLE_ADD_DOCKER;
        return `
            <div class="modal-content">
                <span class="close close-modal-button" aria-label="${ARIA_LABEL_CLOSE_MODAL}">&times;</span>
                <h2>${title}</h2>
                <input type="text" id="${INPUT_ID_DOCKER_DISPLAY_NAME}" placeholder="容器自定义显示名称">
                <input type="text" id="${INPUT_ID_DOCKER_NAME}" placeholder="容器名称">
                <input type="text" id="${INPUT_ID_ACCESS_IP}" placeholder="容器访问地址">
                <input type="text" id="${INPUT_ID_ACCESS_PORT}" placeholder="容器访问端口">
                <input type="text" id="${INPUT_ID_DOCKER_API_ADDRESS}" placeholder="Docker API 地址">
                <input type="text" id="${INPUT_ID_DOCKER_API_PORT}" placeholder="Docker API 端口">
                <input type="text" id="${INPUT_ID_DOCKER_DESCRIPTION}" placeholder="容器描述">
                <select id="${SELECT_ID_GROUP_SELECT}"></select>
                <div class="modal-buttons-container">
                    <button class="${BUTTON_CLASS_SAVE}" aria-label="${ARIA_LABEL_SAVE}">保存</button>
                    <button class="${BUTTON_CLASS_CANCEL}" aria-label="${ARIA_LABEL_CANCEL}">取消</button>
                </div>
            </div>
        `;
    }

    /**
     * 设置编辑 Docker 模态框数据
     * @param {string} modalId - 模态框 ID
     * @param {string} dockerId - Docker 容器 ID
     * @param {string} groupId - 分组 ID
     */
    async setupEditDockerModalData(modalId, dockerId, groupId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.setAttribute(DATA_ITEM_ID, dockerId);

        const { dockerDisplayName,dockerName, accessIp, accessPort, dockerApiAddress, dockerApiPort, dockerDescription, groupSelect } =
            this.getDockerInfo(dockerId);

        modalInteractionService.setModalData(modalId, {
            dockerDisplayName,
            dockerName,
            accessIp,
            accessPort,
            dockerApiAddress,
            dockerApiPort,
            dockerDescription,
            groupSelect,
        });
    }
    /**
     * 设置添加 Docker 模态框数据
     * @param {string} modalId - 模态框 ID
     
     * @param {string} groupId - 分组 ID
     */
    async setupAddDockerModalData(modalId, groupId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        

        

        modalInteractionService.setModalData(modalId, {
            
            groupSelect: groupId,
        });
    }

    /**
     * 获取 Docker 容器信息
     * @param {string} dockerId - Docker 容器 ID
     * @returns {object} - Docker 容器信息
     */
    getDockerInfo(dockerId) {
        
        const dockerItem = document.querySelector(`.${CLASS_DOCKER_ITEM}[${DATA_ITEM_ID}="${dockerId}"]`);
        if (!dockerItem) {
            console.error(`Docker item with id ${dockerId} not found`);
            return {};
        }

        let dockerNameElement = dockerItem.querySelector('a');
        if (!dockerNameElement) {
            console.error(`<a> element not found within docker item with id ${dockerId}`);
            return {};
        }

        const dockerDisplayName = dockerNameElement.textContent;
        const dockerName = dockerItem.getAttribute(DATA_DOCKER_NAME);
        const accessUrl = dockerNameElement.getAttribute('href');
        const urlObj = new URL(accessUrl);
        const accessIp = `${urlObj.protocol}//${urlObj.hostname}`; // 提取协议和主机名或 IP 地址
        const accessPort = urlObj.port; // 假设 href 格式为 "ip:port"
        const dockerApiAddress = dockerItem.getAttribute(DATA_DOCKER_SERVER_IP);
        const dockerApiPort = dockerItem.getAttribute(DATA_DOCKER_SERVER_PORT);
        const dockerDescription = dockerItem.getAttribute(DATA_DESCRIPTION);
        const groupSelect = dockerItem.getAttribute(DATA_GROUP_ID);

        return {
            dockerDisplayName,
            dockerName,
            accessIp,
            accessPort,
            dockerApiAddress,
            dockerApiPort,
            dockerDescription,
            groupSelect,
        };
    }
}