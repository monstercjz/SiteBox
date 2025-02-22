import modalInteractionService from './modalInteractionService.js';
import { WebsiteSaveService } from './websiteDataService.js';
import { fetchAndRenderGroupSelect } from './groupSelectDataService.js';
import { getWebsiteGroups, createWebsiteGroup } from './api.js';
import { showNotification } from './utils.js';
import { validateAndCompleteUrl } from './utils.js';
import {
    WEBSITE_MODAL_ID,
    INPUT_ID_NEW_WEBSITE_NAME,
    INPUT_ID_NEW_WEBSITE_URL,
    INPUT_ID_NEW_WEBSITE_DESCRIPTION,
    SELECT_ID_GROUP_SELECT,
    DATA_ITEM_ID,
    DATA_DESCRIPTION,
    DATA_GROUP_ID,
    MODAL_TITLE_EDIT_WEBSITE,
    MODAL_TITLE_ADD_WEBSITE,
    BUTTON_CLASS_SAVE,
    BUTTON_CLASS_CANCEL,
    ARIA_LABEL_CLOSE_MODAL,
    ARIA_LABEL_SAVE,
    ARIA_LABEL_CANCEL,
    MODE_EDIT,
    MODE_ADD,
    ERROR_INVALID_WEBSITE_ID,
    ERROR_INVALID_MODE,
    ERROR_INVALID_CALLBACK,
    ERROR_WEBSITE_ID_IN_ADD_MODE,
    SELECTOR_WEBSITE_ITEM_TEMPLATE,
} from '../config.js';

export class WebsiteOperationService {
    constructor() {
        this.currentWebsiteId = null;
        this.callback = null;
        this.modalId = WEBSITE_MODAL_ID; // 使用常量
        this.websiteSaveService = new WebsiteSaveService();
    }

    /**
     * 清理实例状态
     */
    cleanup() {
        this.currentWebsiteId = null;
        this.callback = null;
    }

    /**
     * 打开网站操作模态框
     * @param {object} options - 配置选项
     * @param {string} options.websiteId - 网站 ID
     * @param {'edit'|'add'} options.mode - 操作模式
     * @param {function} options.callback - 保存回调函数
     * @param {string} options.groupId - 分组 ID
     * @throws {Error} 如果参数无效或操作失败
     */
    async openWebsiteModal(options) {
        if (document.getElementById(this.modalId)) {
                    modalInteractionService.closeModal(this.modalId);
                    return;
        }
        
        try {
            const { websiteId, mode, callback, groupId } = options;

            if (websiteId && typeof websiteId !== 'string') {
                throw new Error(ERROR_INVALID_WEBSITE_ID);
            }
            if (![MODE_EDIT, MODE_ADD].includes(mode)) {
                throw new Error(ERROR_INVALID_MODE);
            }
            if (typeof callback !== 'function') {
                throw new Error(ERROR_INVALID_CALLBACK);
            }
            if (mode === MODE_ADD && websiteId) {
                throw new Error(ERROR_WEBSITE_ID_IN_ADD_MODE);
            }

            this.currentWebsiteId = websiteId;
            this.callback = callback;
            let validatedGroupId = groupId;

            await this.setupWebsiteModal(mode, websiteId, validatedGroupId);
        } catch (error) {
            console.error('Failed to open website modal:', error);
            this.cleanup();
            throw error;
        }
    }

    /**
     * 设置并打开网站模态框
     * @param {'edit'|'add'} mode - 操作模式
     * @param {string} websiteId - 网站 ID
     * @param {string} groupId - 分组 ID
     */
    async setupWebsiteModal(mode, websiteId, groupId) {
        
        const modalContent = this.createModalContent(mode);
        modalInteractionService.createModal(this.modalId, modalContent);

        const groupSelect = document.getElementById(SELECT_ID_GROUP_SELECT);
        if (groupSelect) {
            await fetchAndRenderGroupSelect('website');
        }

        if (mode === MODE_EDIT) {
            this.setupEditWebsiteModalData(this.modalId, websiteId, groupId);
        }
        if (mode === MODE_ADD && groupId) {
            //分组id不为空，并且是添加模式
            this.setupAddWebsiteModalData(this.modalId,groupId);
        }
        
        modalInteractionService.openModal(this.modalId, {
            onSave: async (modal) => {
                try {
                    const newWebsiteName = modal.querySelector(`#${INPUT_ID_NEW_WEBSITE_NAME}`).value;
                    const newWebsiteUrl = modal.querySelector(`#${INPUT_ID_NEW_WEBSITE_URL}`).value;
                    const newWebsiteDescription = modal.querySelector(`#${INPUT_ID_NEW_WEBSITE_DESCRIPTION}`).value;
                    const newWebsiteGroup = modal.querySelector(`#${SELECT_ID_GROUP_SELECT}`).value;

                    if (this.callback) {
                        const checkNewWebsiteUrl = validateAndCompleteUrl(newWebsiteUrl);
                        console.log('checkNewWebsiteUrl', checkNewWebsiteUrl); // 前端网址自动补全 https://
                        await this.callback({ newWebsiteName, checkNewWebsiteUrl, newWebsiteDescription, newWebsiteGroup });
                    }
                } catch (error) {
                    console.error('Failed to save website:', error);
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
        const title = mode === MODE_EDIT ? MODAL_TITLE_EDIT_WEBSITE : MODAL_TITLE_ADD_WEBSITE;
        return `
            <div class="modal-content">
                <span class="close close-modal-button" aria-label="${ARIA_LABEL_CLOSE_MODAL}">&times;</span>
                <h2>${title}</h2>
                <input type="text" id="${INPUT_ID_NEW_WEBSITE_NAME}" placeholder="网站名称">
                <input type="text" id="${INPUT_ID_NEW_WEBSITE_URL}" placeholder="网站URL">
                <input type="text" id="${INPUT_ID_NEW_WEBSITE_DESCRIPTION}" placeholder="网站描述">
                <select id="${SELECT_ID_GROUP_SELECT}"></select>
                <div class="modal-buttons-container">
                    <button class="${BUTTON_CLASS_SAVE}" aria-label="${ARIA_LABEL_SAVE}">保存</button>
                    <button class="${BUTTON_CLASS_CANCEL}" aria-label="${ARIA_LABEL_CANCEL}">取消</button>
                </div>
            </div>
        `;
    }

    /**
     * 设置编辑网站模态框数据
     * @param {string} modalId - 模态框 ID
     * @param {string} websiteId - 网站 ID
     * @param {string} groupId - 分组 ID
     */
    async setupEditWebsiteModalData(modalId, websiteId, groupId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.setAttribute(DATA_ITEM_ID, websiteId);

        const { websiteName, websiteUrl, websiteDescription, websiteGroupId } = this.getWebsiteInfo(websiteId);

        modalInteractionService.setModalData(modalId, {
            newWebsiteName: websiteName,
            newWebsiteUrl: websiteUrl,
            newWebsiteDescription: websiteDescription,
            groupSelect: websiteGroupId,
        });
    }
    /**
     * 设置添加网站模态框数据，适配的是+号添加
     * @param {string} modalId - 模态框 ID
     * @param {string} groupId - 分组 ID
     */
    async setupAddWebsiteModalData(modalId,groupId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // modal.setAttribute(DATA_ITEM_ID, websiteId);

        // const { websiteName, websiteUrl, websiteDescription, websiteGroupId } = this.getWebsiteInfo(websiteId);

        modalInteractionService.setModalData(modalId, {
            // newWebsiteName: websiteName,
            // newWebsiteUrl: websiteUrl,
            // newWebsiteDescription: websiteDescription,
            groupSelect: groupId,
        });
    }

    /**
     * 获取网站信息
     * @param {string} websiteId - 网站 ID
     * @returns {object} - 网站信息
     */
    getWebsiteInfo(websiteId) {
        const websiteItem = document.querySelector(SELECTOR_WEBSITE_ITEM_TEMPLATE(websiteId));
        // const websiteItem = document.querySelector(`.website-item[data-website-id="${websiteId}"]`);
        if (!websiteItem) {
            console.error(`Website item with id ${websiteId} not found`);
            return {};
        }

        const websiteUrl = websiteItem.querySelector('a').getAttribute('href');
        const websiteName = websiteItem.querySelector('a').textContent;
        const websiteDescription = websiteItem.getAttribute(DATA_DESCRIPTION);
        const websiteGroupId = websiteItem.getAttribute(DATA_GROUP_ID);

        return { websiteName, websiteUrl, websiteDescription, websiteGroupId };
    }
}