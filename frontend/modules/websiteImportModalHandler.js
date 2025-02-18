import modalInteractionService from './modalInteractionService.js';
import { getWebsiteGroups } from './api.js';

export class WebsiteImportModalHandler {
  constructor() {
    this.modalId = 'importWebsitesModal';
  }

  async showImportModal(onSave, onCancel) {
    if (document.getElementById(this.modalId)) {
                modalInteractionService.closeModal(this.modalId);
                return;
    }
    const modalContent = this.createModalContent();
    modalInteractionService.createModal(this.modalId, modalContent);
    
    // 填充分组选择
    const groupSelect = document.getElementById('importWebsitesGroupSelect');
    if (groupSelect) {
      const groups = await getWebsiteGroups();
      groupSelect.innerHTML = '<option value="">选择分组</option>';
      groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        groupSelect.appendChild(option);
      });
    }

    modalInteractionService.openModal(this.modalId, {
      onSave: async (modal) => {
        try {
          const websites = modal.querySelector('textarea').value.trim();
          const groupId = modal.querySelector('#importWebsitesGroupSelect').value;
          await onSave(websites, groupId);
        } finally {
          modalInteractionService.closeModal(this.modalId);
        }
      },
      onCancel: () => {
        modalInteractionService.closeModal(this.modalId);
        onCancel?.();
      }
    });
  }

  createModalContent() {
    return `
      <div class="modal-content">
        <span class="close close-modal-button" aria-label="关闭导入网站模态框">&times;</span>
        <h2>导入网站</h2>
        <textarea placeholder="请粘贴网站列表，格式为 网站名+网站地址+描述，一行一个" style="width: 90%; height: 200px;"></textarea>
        <select id="importWebsitesGroupSelect" style="margin-top: 10px;">
          <option value="">选择分组</option>
        </select>
        <div class="modal-buttons-container" style="margin-top: 10px;">
          <button class="save-modal-button">导入</button>
          <button class="cancel-modal-button" style="margin-left: 10px;">取消</button>
        </div>
      </div>
    `;
  }
}

export default new WebsiteImportModalHandler();
