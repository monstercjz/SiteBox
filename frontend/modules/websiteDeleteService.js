// websiteDeleteService.js
import modalInteractionService from './modalInteractionService.js';

const MODAL_ID = 'deleteWebsiteConfirmationModal';

/**
 * 生成模态框内容HTML
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框消息
 * @param {Array} options - 删除选项数组
 * @returns {string} 模态框HTML内容
 */
function generateModalContent(title, message, options) {
  const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#039;');

  const optionButtons = options.length > 0 ? options.map(option => `
      <button 
        class="save-modal-button" 
        data-action="${escapeHtml(option.id)}"
        aria-label="${escapeHtml(option.label)}"
      >
          ${escapeHtml(option.label)}
      </button>
  `).join('') : '<p>无可用选项</p>';

  return `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <span class="close close-modal-button" aria-label="关闭对话框">&times;</span>
          <h2 id="delete-modal-title">${escapeHtml(title)}</h2>
          <p>${escapeHtml(message)}</p>
          <div class="modal-buttons-container">
              ${optionButtons}
              <button 
                class="cancel-modal-button" 
                data-action="cancel"
                aria-label="取消删除"
              >
                  取消
              </button>
          </div>
      </div>
  `;
}

/**
 * 显示删除确认对话框
 * @param {Object} options - 配置选项
 * @param {string} options.title - 对话框标题
 * @param {string} options.message - 对话框消息
 * @param {Array} options.options - 删除选项数组
 * @returns {Promise<string|null>} 返回用户选择的选项ID或null
 * @throws {Error} 如果参数无效
 */
export async function confirmWebsiteDelete({ title, message, options }) {
  if (!title || typeof title !== 'string') {
    throw new Error('Invalid title');
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  if (!Array.isArray(options)) {
    throw new Error('Invalid options');
  }

  return new Promise((resolve) => {
    try {
      const modalContent = generateModalContent(title, message, options);
      modalInteractionService.createModal(MODAL_ID, modalContent);
      modalInteractionService.openModal(MODAL_ID, {
        onSave: (modal, event) => {
          try {
            const action = event.target.dataset.action;
            resolve(action === 'cancel' ? null : action);
          } finally {
            modalInteractionService.closeModal(MODAL_ID);
          }
        },
        onCancel: () => {
          modalInteractionService.closeModal(MODAL_ID);
          resolve(null);
        }
      });
    } catch (error) {
      console.error('确认删除模态框创建失败:', error);
      modalInteractionService.closeModal(MODAL_ID);
      resolve(null);
    }
  });
}