// frontend/modules/dockerOperationService.js

import modalInteractionService from './modalInteractionService.js';
import { fetchAndRenderGroupSelect } from './groupSelectDataService.js';
import * as dockerDataService from './dockerDataService.js';

export class DockerOperationService {
    constructor() {
        this.callback = null;
        this.modalId = 'dockerModal';
        this.currentContainerId = null; // 用于存储当前编辑的容器 ID
    }

    cleanup() {
        this.callback = null;
        this.currentContainerId = null;
    }

    async openAddDockerModal() {
        try {
            await this.setupDockerModal('add');
        } catch (error) {
            console.error('Failed to open docker modal:', error);
            this.cleanup();
            throw error;
        }
    }

    async openEditDockerModal(containerId) {
        try {
            this.currentContainerId = containerId; // 存储当前编辑的容器 ID
            await this.setupDockerModal('edit', containerId);
        } catch (error) {
            console.error('Failed to open edit docker modal:', error);
            this.cleanup();
            throw error;
        }
    }

    async setupDockerModal(mode, containerId) {
        const modalContent = this.createModalContent(mode);
        modalInteractionService.createModal(this.modalId, modalContent);

        const groupSelect = document.getElementById('groupSelect'); // 获取分组选择下拉框
        if (groupSelect) {
            await fetchAndRenderGroupSelect(); // 动态生成分组选项
        }

        if (mode === 'edit') {
            await this.setupEditDockerModalData(this.modalId, containerId); // 加载 Docker 容器数据
        }

        modalInteractionService.openModal(this.modalId, {
            onSave: async (modal) => {
                try {
                    const containerName = modal.querySelector('#containerName').value;
                    const accessIp = modal.querySelector('#accessIp').value;
                    const accessPort = modal.querySelector('#accessPort').value;
                    const dockerApiAddress = modal.querySelector('#dockerApiAddress').value;
                    const dockerApiPort = modal.querySelector('#dockerApiPort').value;
                    const groupSelect = modal.querySelector('#groupSelect').value; // 获取分组选择的值

                    if (this.callback) {
                        await this.callback({ containerName, accessIp, accessPort, dockerApiAddress, dockerApiPort, groupSelect }); // 传递所有需要的输入框的值
                    }
                } catch (error) {
                    console.error('Failed to save docker container info:', error);
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
                <form id="add-docker-form">
                    <div class="form-group">
                        <label for="containerName">容器名称:</label>
                        <input type="text" id="containerName" name="containerName" required>
                    </div>
                    <div class="form-group">
                        <label for="accessIp">访问 IP 地址:</label>
                        <input type="text" id="accessIp" name="accessIp">
                    </div>
                    <div class="form-group">
                        <label for="accessPort">访问端口:</label>
                        <input type="text" id="accessPort" name="accessPort">
                    </div>
                    <div class="form-group">
                        <label for="dockerApiAddress">Docker API 地址:</label>
                        <input type="text" id="dockerApiAddress" name="dockerApiAddress">
                    </div>
                    <div class="form-group">
                        <label for="dockerApiPort">Docker API 端口:</label>
                        <input type="text" id="dockerApiPort" name="dockerApiPort">
                    </div>
                    <div class="form-group">
                        <label for="groupSelect">分组:</label>
                        <select id="groupSelect" name="groupSelect">
                            <option value="">默认分组</option>
                            {/* 分组选项将在此处动态生成 */}
                        </select>
                    </div>
                </form>
                <div class="modal-buttons-container">
                    <button class="save-modal-button" aria-label="添加">添加</button>
                    <button class="cancel-modal-button" aria-label="取消">取消</button>
                </div>
            </div>
        `;
    }

    async setupEditDockerModalData(modalId, containerId) {
        try {
            const dockerInfo = await this.getDockerContainerInfo(containerId); // 获取 Docker 容器信息
            modalInteractionService.setModalData(modalId, { // 填充模态框数据
                containerName: dockerInfo.containerName,
                accessIp: dockerInfo.accessIp,
                accessPort: dockerInfo.accessPort,
                dockerApiAddress: dockerInfo.dockerApiAddress,
                dockerApiPort: dockerInfo.dockerApiPort,
                groupSelect: dockerInfo.groupId, // 分组信息
            });
        } catch (error) {
            console.error('Failed to setup edit docker modal data:', error);
            showNotification('加载 Docker 容器信息失败', 'error');
        }
    }

    async getDockerContainerInfo(containerId) {
        // TODO: 调用 dockerDataService.js 获取 Docker 容器信息
        console.log('getDockerContainerInfo called', containerId);
        return { 
            containerName: 'test-container',
            accessIp: '127.0.0.1',
            accessPort: '8080',
            dockerApiAddress: '192.168.1.100',
            dockerApiPort: '2376',
            groupId: '默认分组' 
        }; // 模拟数据
    }
}

export const dockerOperationService = new DockerOperationService();