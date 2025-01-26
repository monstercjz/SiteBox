import modalInteractionService from './modalInteractionService.js';
import { createGroup, updateGroup, deleteGroup } from './api.js';
import { showNotification } from './dashboardDataService.js';

export class GroupModalHandler {
  constructor() {
    this.currentEditGroupId = null;
  }

  // 创建分组模态框内容
  createGroupModalContent(isEditMode) {
    return `
      <div class="modal-content">
        <span class="close close-modal-button" aria-label="${isEditMode ? '关闭编辑分组模态框' : '关闭添加分组模态框'}">&times;</span>
        <h2>${isEditMode ? '编辑分组' : '添加分组'}</h2>
        <input type="text" id="newGroupName" placeholder="新分组名称">
        <div class="modal-buttons-container">
          <button class="save-modal-button" aria-label="${isEditMode ? '保存分组' : '添加新分组'}">保存</button>
          <button class="cancel-modal-button" aria-label="取消创建分组">取消</button>
        </div>
      </div>
    `;
  }

  // 打开分组模态框
  async openGroupModal(groupId = null) {
    const isEditMode = !!groupId;
    this.currentEditGroupId = groupId;
    const modalId = 'groupModal';

    // 创建模态框内容
    const modalContent = this.createGroupModalContent(isEditMode);
    modalInteractionService.createModal(modalId, modalContent);

    // 如果是编辑模式，设置初始数据
    if (isEditMode) {
      this.setupEditGroupModalData(modalId, groupId);
    }

    // 打开模态框
    modalInteractionService.openModal(modalId);
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

  // 处理保存操作
  async handleSave(newGroupName) {
    const modalId = 'groupModal';
    try {
      if (this.currentEditGroupId) {
        // 编辑分组
        const updatedGroup = await updateGroup(this.currentEditGroupId, { 
          name: newGroupName, 
          isCollapsible: false 
        });
        if (updatedGroup) {
          showNotification('分组名称更新成功', 'success');
          return updatedGroup;
        }
      } else {
        // 添加分组
        const newGroup = await createGroup({ 
          name: newGroupName, 
          isCollapsible: false 
        });
        if (newGroup) {
          showNotification('分组添加成功', 'success');
          return newGroup;
        }
      }
    } catch (error) {
      console.error('Failed to save group:', error);
      showNotification('操作失败，请重试', 'error');
      throw error;
    } finally {
      modalInteractionService.closeModal(modalId);
      this.currentEditGroupId = null;
    }
  }
}
