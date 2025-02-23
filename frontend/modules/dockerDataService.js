import { createDocker, updateDocker, deleteDocker, batchMoveWebsites, moveToTrash, recordWebsiteClick, startDockerContainer, stopDockerContainer, restartDockerContainer } from './api.js';
import { showNotification } from './utils.js';
import { validateAndCompleteUrl } from './utils.js';
import {
    NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL,
    NOTIFICATION_DOCKER_UPDATE_SUCCESS,
    NOTIFICATION_DOCKER_CREATE_SUCCESS,
    NOTIFICATION_SAVE_DOCKER_FAIL,
    NOTIFICATION_DOCKER_DELETE_SUCCESS,
    NOTIFICATION_DELETE_DOCKER_FAIL,
    DEFAULT_GROUP_NAME,
    DATA_DOCKER_DATA,
    OPTION_ID_PERMANENT_DELETE,
    OPTION_ID_MOVE_TO_TRASH,
    API_METHOD_CREATE_DOCKER_GROUP,
    API_METHOD_GET_DOCKER_GROUPS,
    ERROR_FETCH_OR_CREATE_DEFAULT_GROUP,
    GROUP_TYPE_DOCKER,
    DASHBOARD_TYPE_DOCKER
} from '../config.js';

export class DockerSaveService {
    async saveDocker(dockerId, dockerData, groupId) {
        try {
            let actualGroupId = groupId;
            if (!actualGroupId) {
                const { getDockerGroups, createDockerGroup } = await import('./api.js');
                try {
                    const groups = await getDockerGroups();
                    let defaultGroup;
                    if (groups) {
                        defaultGroup = groups.find(group => group.name === DEFAULT_GROUP_NAME);
                        
                    }

                    if (!defaultGroup) {
                        const groupName = new Date().toLocaleString();
                        const newGroup = await createDockerGroup({ name: groupName, isCollapsible: false,groupType: GROUP_TYPE_DOCKER,dashboardType:DASHBOARD_TYPE_DOCKER });
                        actualGroupId = newGroup.id;
                    } else {
                        actualGroupId = defaultGroup.id;
                    }
                } catch (error) {
                    console.error(ERROR_FETCH_OR_CREATE_DEFAULT_GROUP, error);
                    showNotification(NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL, 'error');
                    throw error;
                }
            }

            if (dockerId) {
                // 更新容器
                const updatedDocker = await updateDocker(dockerId, { [DATA_DOCKER_DATA]: dockerData });
                showNotification(NOTIFICATION_DOCKER_UPDATE_SUCCESS, 'success');
                return updatedDocker;
            } else {
                // 创建容器
                const newDocker = await createDocker(actualGroupId, { [DATA_DOCKER_DATA]: dockerData });
                showNotification(NOTIFICATION_DOCKER_CREATE_SUCCESS, 'success');
                return newDocker;
            }
        } catch (error) {
            console.error('Failed to save docker:', error);
            showNotification(NOTIFICATION_SAVE_DOCKER_FAIL, 'error');
            throw error;
        }
    }

    async deleteDocker(dockerId, deleteOption) {
        try {
            if (deleteOption === OPTION_ID_PERMANENT_DELETE) {
                const response = await deleteDocker(dockerId);
                showNotification(NOTIFICATION_DOCKER_DELETE_SUCCESS, 'success');
                return response;
            } else if (deleteOption === OPTION_ID_MOVE_TO_TRASH) {
                // const response = await moveToTrash(dockerId);
                // showNotification('容器已移动到回收站', 'success');
                const response = await deleteDocker(dockerId);
                showNotification(NOTIFICATION_DOCKER_DELETE_SUCCESS, 'success');
                return response;
            }
        } catch (error) {
            console.error('Failed to delete docker:', error);
            showNotification(NOTIFICATION_DELETE_DOCKER_FAIL, 'error');
            throw error;
        }
    }

    async startDockerContainer(dockerId) {
        try {
            const response = await startDockerContainer(dockerId); // 调用 api.js 中的函数
            showNotification(response.message, 'success');
            return response;
        } catch (error) {
            console.error('Failed to start docker container:', error);
            showNotification('启动 Docker 容器失败', 'error');
            throw error;
        }
    }

    async stopDockerContainer(dockerId) {
        try {
            const response = await stopDockerContainer(dockerId); // 调用 api.js 中的函数
            showNotification(response.message, 'success');
            return response;
        } catch (error) {
            console.error('Failed to stop docker container:', error);
            showNotification('停止 Docker 容器失败', 'error');
            throw error;
        }
    }

    async restartDockerContainer(dockerId) {
        try {
            const response = await restartDockerContainer(dockerId); // 调用 api.js 中的函数
            showNotification(response.message, 'success');
            return response;
        } catch (error) {
            console.error('Failed to restart docker container:', error);
            showNotification('重启 Docker 容器失败', 'error');
            throw error;
        }
    }
}