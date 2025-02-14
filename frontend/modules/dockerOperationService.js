import modalInteractionService from './modalInteractionService.js';
import { fetchAndRenderGroupSelect } from './groupSelectDataService.js';
import { getWebsiteGroups, createWebsiteGroup } from './api.js';
import { showNotification } from './websiteDashboardService.js';
import { validateAndCompleteUrl } from './utils.js';
export class DockerOperationService {
  constructor() {
    this.currentWebsiteId = null;
    this.callback = null;
    this.modalId = 'dockerModal';
    
  }

  cleanup() {
    this.currentWebsiteId = null;
    this.callback = null;
  }

  async openDockerModal(options) {
    console.log('opendockerModal', options);
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

  async setupWebsiteModal(mode, dockerId, groupId) {
    const modalContent = this.createModalContent(mode);
    modalInteractionService.createModal(this.modalId, modalContent);
    const groupSelect = document.getElementById('groupSelect');
    if (groupSelect) {
        await fetchAndRenderGroupSelect('docker');
    }

    if (mode === 'edit') {
      this.setupEditDockerModalData(this.modalId, dockerId, groupId);
    }

    modalInteractionService.openModal(this.modalId, {
      onSave: async (modal) => {
        try {
            const dockerName = modal.querySelector('#dockerName').value;
            const accessIp = modal.querySelector('#accessIp').value;
            const accessPort = modal.querySelector('#accessPort').value;
            const dockerApiAddress = modal.querySelector('#dockerApiAddress').value;
            const dockerApiPort = modal.querySelector('#dockerApiPort').value;
            const dockerDescription = modal.querySelector('#dockerDescription').value;
            const groupSelect = modal.querySelector('#groupSelect').value; // 获取分组选择的值
          if (this.callback) {
            const newaccessIp = validateAndCompleteUrl(accessIp);
            await this.callback({ dockerName, newaccessIp, accessPort, dockerApiAddress,dockerApiPort, dockerDescription,groupSelect });
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
      }
    });
  }

  createModalContent(mode) {
    const title = mode === 'edit' ? '编辑 Docker 容器' : '添加 Docker 容器';
    return `
        <div class="modal-content">
            <span class="close close-modal-button" aria-label="关闭模态框">&times;</span>
            <h2>${title}</h2>
            <input type="text" id="dockerName" placeholder="容器名称">
            <input type="text" id="accessIp" placeholder="容器访问地址">
            <input type="text" id="accessPort" placeholder="容器访问端口">
            <input type="text" id="dockerApiAddress" placeholder=" Docker API 地址">
            <input type="text" id="dockerApiPort" placeholder=" Docker API 端口">
            <input type="text" id="dockerDescription" placeholder="容器描述">
            <select id="groupSelect"></select>
            <div class="modal-buttons-container">
                <button class="save-modal-button" aria-label="保存">保存</button>
                <button class="cancel-modal-button" aria-label="取消">取消</button>
            </div>
        </div>
    `;
  }

  async setupEditDockerModalData(modalId, dockerId, groupId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.setAttribute('data-docker-id', dockerId);
    const { dockerName, accessIp, accessPort, dockerApiAddress,dockerApiPort, dockerDescription,groupSelect } = this.getDockerInfo(dockerId);  
    modalInteractionService.setModalData(modalId, {
        dockerName: dockerName,
        accessIp: accessIp,
        accessPort: accessPort,
        dockerApiAddress: dockerApiAddress,
        dockerApiPort: dockerApiPort,
        dockerDescription: dockerDescription,
        groupSelect: groupSelect

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

    getDockerInfo(dockerId) {
        console.log('getDockerInfo dockerId:', dockerId);
        const dockerItem = document.querySelector(`.docker-item[data-docker-id="${dockerId}"]`);
        if (!dockerItem) {
            console.error(`Docker item with id ${dockerId} not found`);
            return {};
        }

        let dockerNameElement = dockerItem.querySelector('a');
        if (!dockerNameElement) {
            console.error(`<a> element not found within docker item with id ${dockerId}`);
            return {};
        }
        const dockerName = dockerNameElement.textContent;
        const accessUrl = dockerItem.querySelector('a').getAttribute('href');
        const urlObj = new URL(accessUrl);
        const accessIp = `${urlObj.protocol}//${urlObj.hostname}`; // 提取协议和主机名或 IP 地址
        const accessPort = urlObj.port; // 假设 href 格式为 "ip:port"
        const dockerApiAddress = dockerItem.getAttribute('data-docker-server-ip');
        const dockerApiPort = dockerItem.getAttribute('data-docker-server-port');
        const dockerDescription = dockerItem.getAttribute('data-description');
        const groupSelect = dockerItem.getAttribute('data-group-id');

        return { dockerName, accessIp, accessPort, dockerApiAddress,dockerApiPort, dockerDescription,groupSelect };
    }
}