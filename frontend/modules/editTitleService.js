import modalInteractionService from './modalInteractionService.js';

import {
    MODAL_ID,
    MODAL_TITLE_EDIT,
    MODAL_TITLE_ADD,
    INPUT_ID_NEW_GROUP_NAME,
    SELECT_ID_GROUP_TYPE,
    MODAL_TITLE_EDIT_SITE_NAME,
    INPUT_ID_NEW_SITE_NAME,
    BUTTON_CLASS_SAVE,
    BUTTON_CLASS_CANCEL,
    GROUP_TYPE_WEBSITE,
    GROUP_TYPE_DOCKER,
    GROUP_LABEL_WEBSITE,
    GROUP_LABEL_DOCKER,
    DASHBOARD_TYPE_WEBSITE,
    DASHBOARD_TYPE_DOCKER,
    ARIA_LABEL_CLOSE_MODAL,
    ARIA_LABEL_SAVE,
    ARIA_LABEL_CANCEL,
    SELECTOR_GROUP_TEMPLATE,
    GROUP_NAME,
} from '../config.js';

export class EditsiteNameOperationService {
    constructor() {
        this.currentGroupId = null;
        this.callback = null;
        this.modalId = MODAL_ID; // 使用常量
    }

    /**
     * 清理实例状态
     */
    cleanup() {
        this.currentGroupId = null;
        this.callback = null;
    }

    /**
     * 打开分组操作模态框
     * @param {object} options - 配置选项
     * @param {string} options.groupId - 分组ID
     * @param {'edit'|'add'} options.mode - 操作模式
     * @param {function} options.callback - 保存回调函数
     * @param {string} [options.groupType='website'] - 分组类型，'website' 或 'docker'，默认为 'website'
     * @throws {Error} 如果参数无效或操作失败
     */
    async openGroupModal(options) {
        if (document.getElementById(this.modalId)) {
            modalInteractionService.closeModal(this.modalId);
            return;
        }
        try {
            const { callback } = options;
            if (typeof callback !== 'function') {
                throw new Error('Invalid callback');
            }
            this.callback = callback;
            // 创建并配置模态框
            await this.setupGroupModal();
        } catch (error) {
            console.error('Failed to open group modal:', error);
            this.cleanup();
            throw error;
        }
    }

    /**
     * 设置并打开分组模态框
     * @param {'edit'|'add'} mode - 操作模式
     * @param {string} groupId - 分组ID
     * @param {string} groupType - 分组类型
     */
    async setupGroupModal() {
        const modalContent = this.createModalContent();
        modalInteractionService.createModal(this.modalId, modalContent);
        modalInteractionService.openModal(this.modalId, {
            onSave: async (modal, event) => {
                try {
                    const newSiteName = modal.querySelector(`#${INPUT_ID_NEW_SITE_NAME}`).value;
                    console.log('newSiteName:', newSiteName);
                    console.log('this.callback:', this.callback);
                    if (this.callback) {
                        console.log('newSiteName:', newSiteName);
                        await this.callback({ newSiteName }); // Pass dashboardType to callback
                    }
                } catch (error) {
                    console.error('Failed to save group:', error);
                    throw error;
                } finally {                    
                    modalInteractionService.closeModal(this.modalId); // 确保关闭模态框
                    this.cleanup();
                }
            },
            onCancel: (modal, event) => {
                
                modalInteractionService.closeModal(this.modalId); // 确保关闭模态框
                this.cleanup();
            }
        });
    }

    // 创建模态框内容
    createModalContent() {
        return `
              <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="site-name-modal-title">
                <span class="close close-modal-button" aria-label="${ARIA_LABEL_CLOSE_MODAL}">&times;</span>
                <h2 id="site-name-modal-title">${MODAL_TITLE_EDIT_SITE_NAME}</h2>
                <div class="modal-input-group">
                    <label for="${INPUT_ID_NEW_SITE_NAME}">网站名称:</label>
                    <input type="text" id="${INPUT_ID_NEW_SITE_NAME}" placeholder="新网站名称">
                </div>
                
                <div class="modal-buttons-container">
                  <button class="${BUTTON_CLASS_SAVE}" data-action="save" aria-label="${ARIA_LABEL_SAVE}">保存</button>
                  <button class="${BUTTON_CLASS_CANCEL}" data-action="cancel" aria-label="${ARIA_LABEL_CANCEL}">取消</button>
                </div>
              </div>
            `;
    }

    
}