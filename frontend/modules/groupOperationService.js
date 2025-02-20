import modalInteractionService from './modalInteractionService.js';
import { GroupSaveService } from './groupDataService.js';
import {
    MODAL_ID,
    MODAL_TITLE_EDIT,
    MODAL_TITLE_ADD,
    INPUT_ID_NEW_GROUP_NAME,
    SELECT_ID_GROUP_TYPE,
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

export class GroupOperationService {
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
            const { groupId, mode, callback, groupType = GROUP_TYPE_WEBSITE } = options;

            // 参数验证
            if (groupId && typeof groupId !== 'string') {
                throw new Error('groupId must be a string when provided');
            }
            if (!['edit', 'add'].includes(mode)) {
                throw new Error('Invalid mode');
            }
            if (typeof callback !== 'function') {
                throw new Error('Invalid callback');
            }
            if (mode === 'add' && groupId) {
                throw new Error('groupId should be empty in add mode');
            }
            if (![GROUP_TYPE_WEBSITE, GROUP_TYPE_DOCKER].includes(groupType)) {
                throw new Error('Invalid groupType');
            }

            this.currentGroupId = groupId;
            this.callback = callback;
            this.groupType = groupType; // Store groupType

            // 创建并配置模态框
            await this.setupGroupModal(mode, groupId, groupType);

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
    async setupGroupModal(mode, groupId, groupType) {
        const modalContent = this.createModalContent(mode, groupType);
        modalInteractionService.createModal(this.modalId, modalContent);
        if (mode === 'edit') {
            this.setupEditGroupModalData(this.modalId, groupId, this.groupType); // 传递 groupType
        }
        modalInteractionService.openModal(this.modalId, {
            onSave: async (modal, event) => {
                try {
                    
                    const newGroupName = modal.querySelector(`#${INPUT_ID_NEW_GROUP_NAME}`).value;
                    const groupTypeSelect = modal.querySelector(`#${SELECT_ID_GROUP_TYPE}`).value; // 获取选择的分组类型
                    const dashboardType = groupTypeSelect.startsWith(GROUP_TYPE_WEBSITE) ? DASHBOARD_TYPE_WEBSITE : DASHBOARD_TYPE_DOCKER; // Determine dashboardType
                    
                    if (this.callback) {
                        await this.callback({ newGroupName, groupType: groupTypeSelect, dashboardType }); // Pass dashboardType to callback
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
    createModalContent(mode, groupType) {
        return `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="group-modal-title">
        <span class="close close-modal-button" aria-label="${ARIA_LABEL_CLOSE_MODAL}">&times;</span>
        <h2 id="group-modal-title">${mode === 'edit' ? MODAL_TITLE_EDIT : MODAL_TITLE_ADD}</h2>
        <div class="modal-input-group">
            <label for="${INPUT_ID_NEW_GROUP_NAME}">分组名称:</label>
            <input type="text" id="${INPUT_ID_NEW_GROUP_NAME}" placeholder="新分组名称">
        </div>
        
        <div class="modal-input-group">
            <label for="${SELECT_ID_GROUP_TYPE}">分组类型:</label>
            <select id="${SELECT_ID_GROUP_TYPE}" ${mode === 'edit' ? 'disabled' : ''}>
                <option value="${GROUP_TYPE_WEBSITE}" ${groupType === GROUP_TYPE_WEBSITE ? 'selected' : ''}>${GROUP_LABEL_WEBSITE}</option>
                <option value="${GROUP_TYPE_DOCKER}" ${groupType === GROUP_TYPE_DOCKER ? 'selected' : ''}>${GROUP_LABEL_DOCKER}</option>
            </select>
        </div>
        
        <div class="modal-buttons-container">
          <button class="${BUTTON_CLASS_SAVE}" data-action="save" aria-label="${ARIA_LABEL_SAVE}">保存</button>
          <button class="${BUTTON_CLASS_CANCEL}" data-action="cancel" aria-label="${ARIA_LABEL_CANCEL}">取消</button>
        </div>
      </div>
    `;
    }

    // 设置编辑分组模态框数据
    setupEditGroupModalData(modalId, groupId, groupType) {
        
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.setAttribute('data-group-id', groupId);

        // 根据 groupType 动态构建选择器
        const groupClass = groupType === GROUP_TYPE_WEBSITE ? GROUP_TYPE_WEBSITE : GROUP_TYPE_DOCKER;
        // const groupDiv = document.querySelector(`.${groupClass}:has(h2[id^="${groupType}-title-${groupId}"])`);//此处是在没有给元素添加id属性的时候才会用到这个选择器
        const groupDiv = document.querySelector(SELECTOR_GROUP_TEMPLATE(groupType, groupId));//设置id属性之后，直接用这个
        if (!groupDiv) return;

        const editInput = groupDiv.querySelector('h2');
        
        if (editInput) {
            // const newGroupName = editInput.textContent.trim();
            const groupNameSpan = editInput.querySelector(`.${GROUP_NAME}`);
            if (groupNameSpan) {
                const newGroupName = groupNameSpan.textContent.trim();
                modalInteractionService.setModalData(modalId, {
                    newGroupName: newGroupName || '',
                    groupTypeSelect: groupType // Set groupType from stored value
                });
            }
            
        }
    }
}