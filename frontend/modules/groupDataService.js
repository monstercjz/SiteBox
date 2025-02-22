import { createWebsiteGroup, updateWebsiteGroup, deleteWebsiteGroup, getWebsitesByGroupId, moveToTrash, createDockerGroup, updateDockerGroup, deleteDockerGroup } from './api.js';
import { showNotification } from './utils.js';
import {
    NOTIFICATION_GROUP_UPDATE_SUCCESS,
    NOTIFICATION_GROUP_CREATE_SUCCESS,
    NOTIFICATION_SAVE_GROUP_FAIL,
    NOTIFICATION_GROUP_DELETE_SUCCESS,
    NOTIFICATION_DELETE_GROUP_FAIL,
    GROUP_TYPE_WEBSITE,
    GROUP_TYPE_DOCKER,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    API_METHOD_CREATE_WEBSITE_GROUP,
    API_METHOD_UPDATE_WEBSITE_GROUP,
    API_METHOD_DELETE_WEBSITE_GROUP,
    API_METHOD_CREATE_DOCKER_GROUP,
    API_METHOD_UPDATE_DOCKER_GROUP,
    API_METHOD_DELETE_DOCKER_GROUP,
    DASHBOARD_TYPE_WEBSITE,
    DASHBOARD_TYPE_DOCKER,
    ERROR_FAILED_TO_SAVE_GROUP,
    ERROR_FAILED_TO_DELETE_GROUP,
} from '../config.js';

export class GroupSaveService {
    // 保存分组
    async saveGroup(groupId, groupData, groupType) {
        try {
            if (groupId) {
                // 更新分组
                const updatedGroup = await (
                    groupType === GROUP_TYPE_DOCKER
                        ? updateDockerGroup(groupId, groupData)
                        : updateWebsiteGroup(groupId, groupData)
                );
                showNotification(NOTIFICATION_GROUP_UPDATE_SUCCESS, 'success');
                return updatedGroup;
            } else {
                // 创建分组
                const newGroup = await (
                    groupType === GROUP_TYPE_DOCKER
                        ? createDockerGroup(groupData)
                        : createWebsiteGroup(groupData)
                );
                showNotification(NOTIFICATION_GROUP_CREATE_SUCCESS, 'success');
                return newGroup;
            }
        } catch (error) {
            console.error(ERROR_FAILED_TO_SAVE_GROUP, error);
            showNotification(NOTIFICATION_SAVE_GROUP_FAIL, 'error');
            throw error;
        }
    }

    // 删除分组
    async deleteGroup(groupId, deleteOption, groupType) {
        try {
            let response;
            if (deleteOption === OPTION_ID_PERMANENT_DELETE) {
                response = await (
                    groupType === GROUP_TYPE_DOCKER
                        ? deleteDockerGroup(groupId)
                        : deleteWebsiteGroup(groupId)
                );
            } else if (deleteOption === OPTION_ID_MOVE_TO_TRASH && groupType === GROUP_TYPE_WEBSITE) {
                const websites = await getWebsitesByGroupId(groupId);
                if (websites && websites.length > 0) {
                    const websiteIds = websites.map(website => website.id);
                    
                    await moveToTrash(websiteIds);
                }
                response = await deleteWebsiteGroup(groupId);//根据 groupType 调用不同的删除 API
            } else if (deleteOption === OPTION_ID_MOVE_TO_TRASH && groupType === GROUP_TYPE_DOCKER) {
                response = await deleteDockerGroup(groupId);
            }
            showNotification(NOTIFICATION_GROUP_DELETE_SUCCESS, 'success');
            return response;
        } catch (error) {
            console.error(ERROR_FAILED_TO_DELETE_GROUP, error);
            showNotification(NOTIFICATION_DELETE_GROUP_FAIL, 'error');
            throw error;
        }
    }
}