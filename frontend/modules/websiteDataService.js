import { createWebsite, updateWebsite, deleteWebsite, batchMoveWebsites, moveToTrash, recordWebsiteClick } from './api.js';
import { showNotification } from './dashboardDataService.js';
import { validateAndCompleteUrl } from './utils.js';

export class WebsiteSaveService {
  async saveWebsite(websiteId, websiteData, groupId) {
    try {
        console.log('groupId:', groupId);
        console.log('websiteData:', websiteData);
        console.log('websiteId:', websiteId);
        let actualGroupId = groupId;
        if (!actualGroupId) {
            const { getGroups, createGroup } = await import('./api.js');
            try {
                const  groups  = await getGroups();
                console.log('groups:', groups);
                let defaultGroup;
                if (groups) {
                    
                    defaultGroup = groups.find(group => group.name === 'Default');
                    console.log('defaultGroup:', defaultGroup);
                }
                if (!defaultGroup) {
                    const groupName = new Date().toLocaleString();
                    const newGroup = await createGroup({ name: groupName, isCollapsible: false });
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
      if (websiteId) {
        // 更新网站
        const updatedWebsite = await updateWebsite(websiteId, websiteData);
        showNotification('网站更新成功', 'success');
        return updatedWebsite;
      } else {
        // 创建网站
        const newWebsite = await createWebsite(actualGroupId, websiteData);
        showNotification('网站创建成功', 'success');
        return newWebsite;
      }
    } catch (error) {
      console.error('Failed to save website:', error);
      showNotification('保存网站失败，请重试', 'error');
      throw error;
    }
  }

  async deleteWebsite(websiteId, deleteOption) {
    try {
      if (deleteOption === 'permanentDelete') {
        const response = await deleteWebsite(websiteId);
        showNotification('网站删除成功', 'success');
        return response;
      } else if (deleteOption === 'moveToTrash') {
        const response = await moveToTrash(websiteId);
        showNotification('网站已移动到回收站', 'success');
        return response;
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      showNotification('删除网站失败，请重试', 'error');
      throw error;
    }
  }

  async moveWebsites(websiteIds, groupId) {
    try {
      const response = await batchMoveWebsites(websiteIds, groupId);
      showNotification('网站移动成功', 'success');
      return response;
    } catch (error) {
      console.error('Failed to move websites:', error);
      showNotification('移动网站失败，请重试', 'error');
      throw error;
    }
  }

  /**
   * 记录网站点击时间
   * @param {string} websiteId - 网站ID
   * @returns {Promise} - 返回API调用结果
   */
  async recordWebsiteClick(websiteId) {
    try {
      const response = await recordWebsiteClick(websiteId);
      return response;
    } catch (error) {
      console.error('Failed to record website click:', error);
      throw error;
    }
  }

  /**
   * 解析导入的网站数据
   * @param {string} rawData - 原始数据
   * @returns {Array} 解析后的网站对象数组
   */
  parseImportedWebsites(rawData) {
    return rawData.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split('+').map(item => item.trim());
        return {
          name: parts[0] || '',
          url: parts[1] || '',
          description: parts[2] || ''
        };
      });
  }

  /**
   * 验证网站数据
   * @param {Array} websites - 网站数据数组
   * @returns {boolean} 是否包含有效数据
   */
  validateImportedWebsites(websites) {
    return websites.length > 0;
  }

  /**
   * 导入网站
   * @param {string} rawData - 原始数据
   * @param {string} groupId - 分组ID
   * @returns {Object} 导入结果
   */
  async importWebsites(rawData, groupId) {
    try {
      const websites = this.parseImportedWebsites(rawData);
      
      if (!this.validateImportedWebsites(websites)) {
        return {
          success: false,
          message: '没有检测到有效的网站数据'
        };
      }

      // Validate and complete URLs
      const validatedWebsites = websites.map(website => {
        const validatedUrl = validateAndCompleteUrl(website.url);
        return validatedUrl ? {
          name: website.name,
          url: validatedUrl,
          description: website.description
        } : null;
      }).filter(Boolean);

      if (validatedWebsites.length === 0) {
        return {
          success: false,
          message: '没有有效的URL'
        };
      }

      let actualGroupId = groupId;
      if (!actualGroupId) {
        const { getGroups, createGroup } = await import('./api.js');
        const groups = await getGroups();
        const groupName = new Date().toLocaleString();
        const newGroup = await createGroup({ name: groupName, isCollapsible: false });
        actualGroupId = newGroup.id;
      }

      const { batchImportWebsites } = await import('./api.js');
      const result = await batchImportWebsites(validatedWebsites, actualGroupId);
      
      return {
        success: result.success,
        count: result.count,
        message: result.success ? null : '导入网站失败'
      };
    } catch (error) {
      console.error('Failed to import websites:', error);
      throw error;
    }
  }
}
