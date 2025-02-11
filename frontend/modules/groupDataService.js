import { createWebsiteGroup, updateWebsiteGroup, deleteWebsiteGroup ,getWebsitesByGroupId, moveToTrash} from './api.js';
import { showNotification } from './dashboardDataService.js';

export class GroupSaveService {
  // 保存分组
  async saveGroup(groupId, groupData) {
    try {
      if (groupId) {
        // 更新分组
        const updatedGroup = await updateWebsiteGroup(groupId, groupData);
        showNotification('分组更新成功', 'success');
        return updatedGroup;
      } else {
        // 创建分组
        const newGroup = await createWebsiteGroup(groupData);
        showNotification('分组创建成功', 'success');
        return newGroup;
      }
    } catch (error) {
      console.error('Failed to save group:', error);
      showNotification('保存分组失败，请重试', 'error');
      throw error;
    }
  }

  // 删除分组
  async deleteGroup(groupId, deleteOption) {
    try {
        let response;
        if (deleteOption === 'permanentDelete') {
            response = await deleteWebsiteGroup(groupId);
        } else if (deleteOption === 'moveToTrash') {
            //const { getWebsitesByGroupId, moveToTrash } = await import('./api.js');
            const websites = await getWebsitesByGroupId(groupId);
            if (websites && websites.length > 0) {
                const websiteIds = websites.map(website => website.id);
                console.log('websites', websiteIds);
                await moveToTrash(websiteIds);
            }
            response = await deleteWebsiteGroup(groupId);
        }
      showNotification('分组删除成功', 'success');
      return response;
    } catch (error) {
      console.error('Failed to delete group:', error);
      showNotification('删除分组失败，请重试', 'error');
      throw error;
    }
  }
}
