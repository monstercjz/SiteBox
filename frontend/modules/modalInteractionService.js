// modalInteractionService.js
import { GroupSaveService } from './groupDataService.js';


class ModalInteractionService {
  constructor() {
    if (ModalInteractionService.instance) {
      return ModalInteractionService.instance;
    }
    
    this.eventListeners = new Map();
    ModalInteractionService.instance = this;
    
    window.addEventListener('beforeunload', () => this.destroy());
    window.addEventListener('popstate', () => this.destroy());
    
    this.setupEventListeners();
  }

  /**
   * 销毁当前实例，清理所有相关资源
   */
  destroy() {
    console.log('destroy');
    const bodyListener = this.eventListeners.get(document.body);
    if (bodyListener) {
      document.body.removeEventListener(bodyListener.type, bodyListener.handler);
    }

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.remove();
    });

    // 移除所有模态框的事件监听器
    this.eventListeners.forEach((value, key) => {
      if (key !== document.body) {
        this.eventListeners.delete(key);
      }
    });

    this.eventListeners.clear();
    ModalInteractionService.instance = null;
  }

  /**
   * 设置全局事件监听器
   */
  setupEventListeners() {
    const clickHandler = (event) => {
      const target = event.target;
      if (target.classList.contains('close-modal-button')) {
        const modal = target.closest('.modal');
        if (modal) {
          const modalId = modal.id;
          this.closeModal(modalId);
        }
      } else if (target.classList.contains('save-modal-button')) {
        const modal = target.closest('.modal');
        if (modal) {
          const modalId = modal.id;
          const onSave = this.eventListeners.get(modalId)?.onSave;
          if (onSave) {
            onSave(modal, event);
          }
        }
      } else if (target.classList.contains('cancel-modal-button')) {
        const modal = target.closest('.modal');
        if (modal) {
          const modalId = modal.id;
          const onCancel = this.eventListeners.get(modalId)?.onCancel;
          if (onCancel) {
            onCancel(modal, event);
          }
        }
      }
    };
    
    document.body.addEventListener('click', clickHandler);
    this.eventListeners.set(document.body, {
      type: 'click',
      handler: clickHandler
    });
  }

  /**
   * 打开指定ID的模态框
   * @param {string} modalId - 要打开的模态框ID
   * @param {object} [options={}] - 配置选项
   * @param {function} [options.onSave] - 保存按钮点击时的回调
   * @param {function} [options.onCancel] - 取消按钮点击时的回调
   */
  openModal(modalId, options = {}) {
    // 检查模态框是否已存在，如果存在则先关闭
    // const existingModal = document.getElementById(modalId);
    // if (existingModal) {
    //   this.closeModal(modalId);
    // }


    if (!modalId || typeof modalId !== 'string') {
      throw new Error('Invalid modalId: must be a non-empty string');
    }

    const modal = document.getElementById(modalId);
    if (!modal) {
      throw new Error(`Modal with ID "${modalId}" not found`);
    }
    modal.style.display = '';
    modal.classList.add('show-modal');

    this.eventListeners.set(modalId, options);
    console.log('Added event listeners for modal:', modalId);

    // Debugging information
    console.log('Options passed to openModal:', options);
  }

  /**
   * 关闭指定ID的模态框
   * @param {string} modalId - 要关闭的模态框ID
   */
  closeModal(modalId) {
    if (!modalId || typeof modalId !== 'string') {
      throw new Error('Invalid modalId: must be a non-empty string');
    }

    const modal = document.getElementById(modalId);
    if (!modal) {
      throw new Error(`Modal with ID "${modalId}" not found`);
    }

    try {
      modal.classList.add('closing');

      const style = window.getComputedStyle(modal);
      const animationDuration = parseFloat(style.getPropertyValue('animation-duration')) * 1000;

      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modal.remove();
        this.eventListeners.delete(modalId); // 移除模态框的事件监听器
        console.log('Closed and removed modal:', modalId);
      }, animationDuration || 200);
    } catch (error) {
      console.error('Error closing modal:', error);
      // 可以考虑抛出错误或者进行其他处理
    }
  }

  /**
   * 创建新的模态框
   * @param {string} modalId - 模态框的唯一ID
   * @param {string} content - 模态框的HTML内容
   * @returns {string} 创建的模态框ID
   */
  createModal(modalId, content) {
    if (typeof modalId !== 'string' || !modalId.trim()) {
      throw new Error('Invalid modalId: must be a non-empty string');
    }

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('Invalid content: must be a non-empty string');
    }

    if (document.getElementById(modalId)) {
      // this.closeModal(modalId);
      throw new Error(`Modal with ID "${modalId}" already exists`);
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.classList.add('modal');
    
    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    temp.innerHTML = content;
    
    while (temp.firstChild) {
      fragment.appendChild(temp.firstChild);
    }
    
    modal.appendChild(fragment);
    document.body.appendChild(modal);
    return modalId;
  }

  /**
   * 设置模态框数据
   * @param {string} modalId - 要设置数据的模态框的 ID
   * @param {object} data - 要设置的数据
   */
  setModalData(modalId, data) {
    if (typeof modalId !== 'string' || !modalId.trim()) {
      throw new Error('Invalid modalId: must be a non-empty string');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid data: must be a non-array object');
    }

    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error(`Modal with id "${modalId}" not found`);
      return;
    }

    const inputs = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const input = modal.querySelector(`#${key}`);
        if (input) {
          inputs[key] = input;
        } else {
          console.warn(`Input with id "${key}" not found in modal "${modalId}"`);
          // 可以考虑抛出错误或者进行其他处理
        }
      }
    }

    for (const key in data) {
      if (data.hasOwnProperty(key) && inputs[key]) {
        inputs[key].value = data[key];
      } else if (data.hasOwnProperty(key)) {
        console.error(`Input with id "${key}" not found in modal "${modalId}"`);
        // 可以考虑抛出错误或者进行其他处理
      }
    }
  }

}

export default new ModalInteractionService();