import modalInteractionService from './modalInteractionService.js';
import { GroupSaveService } from './groupDataService.js';

export class GroupOperationService {
  constructor() {
    this.currentGroupId = null;
    this.callback = null;
    this.modalId = 'groupModal'; // 提取模态框ID为常量
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
   * @throws {Error} 如果参数无效或操作失败
   */
  async openGroupModal(options) {
    try {
      const { groupId, mode, callback } = options;
      
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

      this.currentGroupId = groupId;
      this.callback = callback;

      // 创建并配置模态框
      await this.setupGroupModal(mode, groupId);
      
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
   */
  async setupGroupModal(mode, groupId) {
    const modalContent = this.createModalContent(mode);
    modalInteractionService.createModal(this.modalId, modalContent);

    if (mode === 'edit') {
      this.setupEditGroupModalData(this.modalId, groupId);
    }

    modalInteractionService.openModal(this.modalId, {
      onSave: async (modal, event) => {
        try {
          console.log('Save button clicked');
          const newGroupName = modal.querySelector('#newGroupName').value;
          if (this.callback) {
            await this.callback({ newGroupName });
          }
        } catch (error) {
          console.error('Failed to save group:', error);
          throw error;
        } finally {
          console.log('Closing modal after save');
          modalInteractionService.closeModal(this.modalId); // 确保关闭模态框
          this.cleanup();
        }
      },
      onCancel: (modal, event) => {
        console.log('Cancel button clicked');
        modalInteractionService.closeModal(this.modalId); // 确保关闭模态框
        this.cleanup();
      }
    });
  }

  // 创建模态框内容
  createModalContent(mode) {
    return `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="group-modal-title">
        <span class="close close-modal-button" aria-label="关闭模态框">&times;</span>
        <h2 id="group-modal-title">${mode === 'edit' ? '编辑分组' : '添加分组'}</h2>
        <input type="text" id="newGroupName" placeholder="新分组名称">
        <div class="modal-buttons-container">
          <button class="save-modal-button" data-action="save" aria-label="保存">保存</button>
          <button class="cancel-modal-button" data-action="cancel" aria-label="取消">取消</button>
        </div>
      </div>
    `;
  }

  // 设置编辑分组模态框数据
  setupEditGroupModalData(modalId, groupId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.setAttribute('data-group-id', groupId);
    const groupDiv = document.querySelector(`.group:has(h2 input[id^="editGroupName-${groupId}"])`);
    if (!groupDiv) return;

    const editInput = groupDiv.querySelector(`#editGroupName-${groupId}`);
    if (editInput) {
      modalInteractionService.setModalData(modalId, { 
        newGroupName: editInput.value || '' 
      });
    }
  }
}