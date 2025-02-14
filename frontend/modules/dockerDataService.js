import { createDocker, updateDocker, deleteDocker, batchMoveWebsites, moveToTrash, recordWebsiteClick } from './api.js';
import { showNotification } from './websiteDashboardService.js';
import { validateAndCompleteUrl } from './utils.js';

export class DockerSaveService {
  async saveDocker(dockerId, dockerData, groupId) {
    try {
        console.log('groupId:', groupId);
        console.log('dockerData:', dockerData);
        console.log('dockerId:', dockerId);
        let actualGroupId = groupId;
        if (!actualGroupId) {
            const { getDockerGroups, createDockerGroup } = await import('./api.js');
            try {
                const  groups  = await getDockerGroups();
                console.log('groups:', groups);
                let defaultGroup;
                if (groups) {
                    
                    defaultGroup = groups.find(group => group.name === 'Default');
                    console.log('defaultGroup:', defaultGroup);
                }
                if (!defaultGroup) {
                    const groupName = new Date().toLocaleString();
                    const newGroup = await createDockerGroup({ name: groupName, isCollapsible: false });
                    actualGroupId = newGroup.id;
                } else {
                    actualGroupId = defaultGroup.id;
                }
            } catch (error) {
                console.error('Failed to fetch or create default group:', error);
                showNotification('创建默认分组失败', 'error');
                throw error;
            }
        }
      if (dockerId) {
        // 更新网站
        const updatedDocker = await updateDocker(dockerId, {dockerData});
        showNotification('网站更新成功', 'success');
        return updatedDocker;
      } else {
        // 创建网站
        const newDocker = await createDocker(actualGroupId, { dockerData });
        showNotification('网站创建成功', 'success');
        return newDocker;
      }
    } catch (error) {
      console.error('Failed to save website:', error);
      showNotification('保存网站失败，请重试', 'error');
      throw error;
    }
  }

  async deleteDocker(dockerId, deleteOption) {
    try {
      if (deleteOption === 'permanentDelete') {
        const response = await deleteDocker(dockerId);
        showNotification('容器删除成功', 'success');
        return response;
      } else if (deleteOption === 'moveToTrash') {
        // const response = await moveToTrash(dockerId);
        // showNotification('网站已移动到回收站', 'success');
        const response = await deleteDocker(dockerId);
        showNotification('容器删除成功', 'success');
        return response;
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      showNotification('删除网站失败，请重试', 'error');
      throw error;
    }
  }

  

  

  

  

  
}
