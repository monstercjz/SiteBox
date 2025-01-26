import modalInteractionService from './modalInteractionService.js';
import { WebsiteSaveService } from './websiteDataService.js';
import { fetchAndRenderGroupSelect } from './groupSelectDataService.js';
import { getGroups, createGroup } from './api.js';
import { showNotification } from './dashboardDataService.js';
import { validateAndCompleteUrl } from './utils.js';
export class WebsiteOperationService {
  constructor() {
    this.currentWebsiteId = null;
    this.callback = null;
    this.modalId = 'websiteModal';
    this.websiteSaveService = new WebsiteSaveService();
  }

  cleanup() {
    this.currentWebsiteId = null;
    this.callback = null;
  }

  async openWebsiteModal(options) {
    console.log('openWebsiteModal', options);
    try {
      const { websiteId, mode, callback, groupId } = options;

      if (websiteId && typeof websiteId !== 'string') {
        throw new Error('websiteId must be a string when provided');
      }
      if (!['edit', 'add'].includes(mode)) {
        throw new Error('Invalid mode');
      }
      if (typeof callback !== 'function') {
        throw new Error('Invalid callback');
      }
      if (mode === 'add' && websiteId) {
          throw new Error('websiteId should be empty in add mode');
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

  async setupWebsiteModal(mode, websiteId, groupId) {
    const modalContent = this.createModalContent(mode);
    modalInteractionService.createModal(this.modalId, modalContent);
    const groupSelect = document.getElementById('groupSelect');
    if (groupSelect) {
        await fetchAndRenderGroupSelect();
    }

    if (mode === 'edit') {
      this.setupEditWebsiteModalData(this.modalId, websiteId, groupId);
    }

    modalInteractionService.openModal(this.modalId, {
      onSave: async (modal) => {
        try {
          const newWebsiteName = modal.querySelector('#newWebsiteName').value;
          const newWebsiteUrl = modal.querySelector('#newWebsiteUrl').value;
          const newWebsiteDescription = modal.querySelector('#newWebsiteDescription').value;
          const newWebsiteGroup = modal.querySelector('#groupSelect').value;
          if (this.callback) {
            const checknewWebsiteUrl = validateAndCompleteUrl(newWebsiteUrl);
            console.log('checknewWebsiteUrl', checknewWebsiteUrl);//前端网址自动补全https://
            await this.callback({ newWebsiteName, checknewWebsiteUrl, newWebsiteDescription, newWebsiteGroup });
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
      }
    });
  }

  createModalContent(mode) {
    return `
      <div class="modal-content">
        <span class="close close-modal-button" aria-label="关闭模态框">&times;</span>
        <h2>${mode === 'edit' ? '编辑网站' : '添加网站'}</h2>
        <input type="text" id="newWebsiteName" placeholder="网站名称">
        <input type="text" id="newWebsiteUrl" placeholder="网站URL">
        <input type="text" id="newWebsiteDescription" placeholder="网站描述">
        <select id="groupSelect"></select>
        <div class="modal-buttons-container">
          <button class="save-modal-button" aria-label="保存">保存</button>
          <button class="cancel-modal-button" aria-label="取消">取消</button>
        </div>
      </div>
    `;
  }

  async setupEditWebsiteModalData(modalId, websiteId, groupId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.setAttribute('data-website-id', websiteId);
    const { websiteName, websiteUrl, websiteDescription, websiteGroupId } = this.getWebsiteInfo(websiteId);
    modalInteractionService.setModalData(modalId, {
        newWebsiteName: websiteName,
        newWebsiteUrl: websiteUrl,
        newWebsiteDescription: websiteDescription,
        groupSelect: websiteGroupId
    });
    // const groupSelect = modal.querySelector('groupSelect');// 删除了一个#在groupSelect前面
    // if (groupSelect) {
    //     const option = document.createElement('option');
    //     option.value = groupId;
    //     option.textContent = groupId;
    //     groupSelect.appendChild(option);
    //     groupSelect.value = groupId;
    // }
  }

    getWebsiteInfo(websiteId) {
        const websiteItem = document.querySelector(`.website-item[data-website-id="${websiteId}"]`);
        const websiteUrl = websiteItem.querySelector('a').getAttribute('href');
        const websiteName = websiteItem.querySelector('a').textContent;
        const websiteDescription = websiteItem.getAttribute('data-description');
        const websiteGroupId = websiteItem.getAttribute('data-group-id');
        return { websiteName, websiteUrl, websiteDescription, websiteGroupId };
    }
}