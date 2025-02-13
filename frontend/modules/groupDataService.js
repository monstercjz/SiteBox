import { createWebsiteGroup, updateWebsiteGroup, deleteWebsiteGroup ,getWebsitesByGroupId, moveToTrash, createDockerGroup, updateDockerGroup,deleteDockerGroup} from './api.js';
import { showNotification } from './websiteDashboardService.js';

export class GroupSaveService {
  // 保存分组
  async saveGroup(groupId, groupData, groupType) {
    try {
      if (groupId) {
        // 更新分组
        const updatedGroup = await (groupType === 'docker-group' ? updateDockerGroup(groupId, groupData) : updateWebsiteGroup(groupId, groupData));
        showNotification('分组更新成功', 'success');
        return updatedGroup;
      } else {
        // 创建分组
        const newGroup = await (groupType === 'docker-group' ? createDockerGroup(groupData) : createWebsiteGroup(groupData));
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
  async deleteGroup(groupId, deleteOption, groupType) { // 添加 groupType 参数
    try {
        let response;
        if (deleteOption === 'permanentDelete') {
            response = await (groupType === 'docker-group' ? deleteDockerGroup(groupId) : deleteWebsiteGroup(groupId)); // 根据 groupType 调用不同的删除 API
        } else if (deleteOption === 'moveToTrash' && groupType === 'website-group') {
            //const { getWebsitesByGroupId, moveToTrash } = await import('./api.js');
            const websites = await getWebsitesByGroupId(groupId);
            if (websites && websites.length > 0) {
                const websiteIds = websites.map(website => website.id);
                console.log('websites', websiteIds);
                await moveToTrash(websiteIds);
            }
            response = await deleteWebsiteGroup(groupId); // 根据 groupType 调用不同的删除 API
        }else if (deleteOption === 'moveToTrash' && groupType === 'docker-group') {
            response = await deleteDockerGroup(groupId); 
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
