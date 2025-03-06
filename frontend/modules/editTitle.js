import { backendUrl } from '../config.js';
import modalInteractionService from './modalInteractionService.js';
import { updateSiteName } from "./api.js";
import { EditsiteNameOperationService } from './editTitleService.js';
import { showNotification } from "./utils.js";
import {
    MODAL_ID,
    MODAL_TITLE_EDIT_SITE_NAME,
    INPUT_ID_NEW_SITE_NAME,
    BUTTON_CLASS_SAVE,
    BUTTON_CLASS_CANCEL,
    ARIA_LABEL_CLOSE_MODAL,
    ARIA_LABEL_SAVE,
    ARIA_LABEL_CANCEL,
} from '../config.js';
const editsiteNameOperationService = new EditsiteNameOperationService();
export async function editSiteName() {
    try {
            await editsiteNameOperationService.openGroupModal({
                
                callback: async ({ newSiteName }) => {
                    console.log('newSiteName:', newSiteName);
                    const result = await updateSiteName( newSiteName); // 传递 groupType
                    console.log('result:', result);
                    if (result) {
                        document.title = newSiteName;
                        // 更新 header 中的 site name 显示
                        const siteNameSpan = document.querySelector('.site-name');
                        if (siteNameSpan) {
                            siteNameSpan.textContent = newSiteName;
                        }
                    }
                },
            });
        } catch (error) {
            console.error('Failed to edit group:', error);
            showNotification(NOTIFICATION_EDIT_GROUP_FAIL, 'error');
        }
}
