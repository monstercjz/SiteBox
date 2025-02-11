import { backendUrl } from '../config.js';

/**
 * 封装 fetch 函数，用于发送 API 请求
 * @param {string} url - 请求 URL
 * @param {string} [method='GET'] - 请求方法
 * @param {object} [body=null] - 请求体
 * @returns {Promise<any>} - 返回 Promise，解析为 API 返回的数据
 * @throws {Error} - 如果 API 请求失败
 */
async function fetchDataFromApi(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${backendUrl}${url}`, options);
  const responseData = await response.json();

  if (!responseData.success) {
    throw new Error(responseData.error || 'API request failed');
  }

  return responseData.data;
}

/**
 * 获取所有网站
 * @returns {Promise<any>} - 返回 Promise，解析为网站列表
 */
async function getWebsites() {
  return fetchDataFromApi('/websites');
}

/**
 * 获取所有网站分组
 * @returns {Promise<any>} - 返回 Promise，解析为网站分组列表
 */
async function getWebsiteGroups() {
  return fetchDataFromApi('/website-groups'); // 网站分组路由保持不变
}

/**
 * 获取所有 Docker 容器分组
 * @returns {Promise<any>} - 返回 Promise，解析为 Docker 容器分组列表
 */
async function getDockerGroups() {
  return fetchDataFromApi('/docker-groups'); // Docker 容器分组使用新路由
}

/**
 * 获取单个网站
 * @param {string} websiteId - 网站 ID
 * @returns {Promise<any>} - 返回 Promise，解析为网站详情
 */
async function getWebsiteById(websiteId) {
  return fetchDataFromApi(`/websites/${websiteId}`);
}

/**
 * 获取单个网站分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为网站分组详情
 */
async function getWebsiteGroupById(groupId) {
  return fetchDataFromApi(`/website-groups/${groupId}`); // 网站分组路由保持不变
}

/**
 * 获取单个 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为 Docker 容器分组详情
 */
async function getDockerGroupById(groupId) {
  return fetchDataFromApi(`/docker-groups/${groupId}`); // Docker 容器分组使用新路由
}

/**
 * 获取某个分组下的所有网站
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为网站列表
 */
async function getWebsitesByGroupId(groupId) {
  return fetchDataFromApi(`/websites/groups/${groupId}/websites`);
}

/**
 * 创建网站
 * @param {string} groupId - 分组 ID
 * @param {object} websiteData - 网站数据
 * @returns {Promise<any>} - 返回 Promise，解析为新创建的网站
 */
async function createWebsite(groupId, websiteData) {
  return fetchDataFromApi(`/websites/groups/${groupId}/websites`, 'POST', websiteData);
}

/**
 * 创建网站分组
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为新创建的网站分组
 */
async function createWebsiteGroup(groupData) {
  return fetchDataFromApi('/website-groups', 'POST', groupData); // 网站分组路由保持不变
}

/**
 * 创建 Docker 容器分组
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为新创建的 Docker 容器分组
 */
async function createDockerGroup(groupData) {
  return fetchDataFromApi('/docker-groups', 'POST', groupData); // Docker 容器分组使用新路由
}

/**
 * 更新网站
 * @param {string} websiteId - 网站 ID
 * @param {object} websiteData - 网站数据
 * @returns {Promise<any>} - 返回 Promise，解析为更新后的网站
 */
async function updateWebsite(websiteId, websiteData) {
  return fetchDataFromApi(`/websites/${websiteId}`, 'PUT', websiteData);
}

/**
 * 更新网站分组
 * @param {string} groupId - 分组 ID
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为更新后的网站分组
 */
async function updateWebsiteGroup(groupId, groupData) {
  return fetchDataFromApi(`/website-groups/${groupId}`, 'PUT', groupData); // 网站分组路由保持不变
}

/**
 * 更新 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为更新后的 Docker 容器分组
 */
async function updateDockerGroup(groupId, groupData) {
  return fetchDataFromApi(`/docker-groups/${groupId}`, 'PUT', groupData); // Docker 容器分组使用新路由
}

/**
 * 删除网站
 * @param {string} websiteId - 网站 ID
 * @returns {Promise<any>} - 返回 Promise，解析为删除结果
 */
async function deleteWebsite(websiteId) {
  return fetchDataFromApi(`/websites/${websiteId}`, 'DELETE');
}

/**
 * 删除网站分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为删除结果
 */
async function deleteWebsiteGroup(groupId) {
  return fetchDataFromApi(`/website-groups/${groupId}`, 'DELETE'); // 网站分组路由保持不变
}

/**
 * 删除 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为删除结果
 */
async function deleteDockerGroup(groupId) {
  return fetchDataFromApi(`/docker-groups/${groupId}`, 'DELETE'); // Docker 容器分组使用新路由
}

/**
 * 批量删除网站
 * @param {string[]} websiteIds - 网站 ID 数组
 * @returns {Promise<any>} - 返回 Promise，解析为删除结果
 */
async function batchDeleteWebsites(websiteIds) {
  return fetchDataFromApi('/websites/batch', 'DELETE', { websiteIds });
}

/**
 * 批量移动网站
 * @param {string[]} websiteIds - 网站 ID 数组
 * @param {string} targetGroupId - 目标分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为移动结果
 */
async function batchMoveWebsites(websiteIds, targetGroupId) {
  return fetchDataFromApi('/websites/batch-move', 'PATCH', { websiteIds, targetGroupId });
}

/**
 * 重新排序网站分组
 * @param {object[]} groups - 分组数组，包含 id 和 order 属性
 * @returns {Promise<any>} - 返回 Promise，解析为排序结果
 */
async function reorderWebsiteGroups(groups) {
  return fetchDataFromApi('/website-groups/reorder', 'PATCH', groups); // 网站分组路由保持不变
}

/**
 * 重新排序 Docker 容器分组
 * @param {object[]} groups - 分组数组，包含 id 和 order 属性
 * @returns {Promise<any>} - 返回 Promise，解析为排序结果
 */
async function reorderDockerGroups(groups) {
  return fetchDataFromApi('/docker-groups/reorder', 'PATCH', groups); // Docker 容器分组使用新路由
}

/**
 * 移动网站到回收站
 * @param {string|string[]} websiteIds - 网站 ID 或网站 ID 数组
 * @returns {Promise<any>} - 返回 Promise，解析为移动结果
 */
async function moveToTrash(websiteIds) {
  return fetchDataFromApi('/sync/moveToTrash', 'POST', { websiteIds });
}

/**
 * 批量导入网站
 * @param {Array} websites - 网站数据数组
 * @param {string} groupId - 分组ID
 * @returns {Promise<any>} - 返回 Promise，解析为导入结果
 */
async function batchImportWebsites(websites, groupId) {
  return fetchDataFromApi('/websites/batchImportWebsites', 'POST', { websites, groupId });
}

/**
 * 记录网站点击时间
 * @param {string} websiteId - 网站ID
 * @returns {Promise<any>} - 返回 Promise，解析为记录结果
 */
async function recordWebsiteClick(websiteId) {
  return fetchDataFromApi('/analytics/click', 'POST', { websiteId });
}
/**
 * 获取单个 Docker 容器
 * @param {string} containerId - 容器 ID
 * @returns {Promise<any>} - 返回 Promise，解析为 Docker 容器详情
 */
async function getDockerContainerById(containerId) {
    return fetchDataFromApi(`/docker/containers/${containerId}`);
}
/**
 * 添加 Docker 容器
 * @param {object} containerInfo - 容器信息
 * @returns {Promise<any>} - 返回 Promise，解析为 API 返回的数据
 */
async function addDockerContainer(containerInfo) {
    return fetchDataFromApi('/docker/containers', 'POST', containerInfo);
}

/**
 * 修改 Docker 容器
 * @param {string} containerId - 容器 ID
 * @param {object} containerInfo - 容器信息
 * @returns {Promise<any>} - 返回 Promise，解析为 API 返回的数据
 */
async function editDockerContainer(containerId, containerInfo) {
    return fetchDataFromApi(`/docker/containers/${containerId}`, 'PUT', containerInfo);
}
/**
 * 获取 Docker 容器列表
 * @returns {Promise<any>} - 返回 Promise，解析为 Docker 容器列表
 */
async function getDockerContainers() {
    return fetchDataFromApi('/docker/containers');
}

  getDockerContainerById,
/**
 * 删除 Docker 容器
 * @param {string} containerId - 容器 ID
 * @returns {Promise<any>} - 返回 Promise，解析为 API 返回的数据
 */
async function deleteDockerContainer(containerId) {
    return fetchDataFromApi(`/docker/containers/${containerId}`, 'DELETE');
}
/**
 * 删除 Docker 容器
 * @param {string} containerId - 容器 ID
 * @returns {Promise<any>} - 返回 Promise，解析为 API 返回的数据
 */
async function deleteDockerContainer(containerId) {
    return fetchDataFromApi(`/docker/containers/${containerId}`, 'DELETE');
}

export {
  fetchDataFromApi,
  getWebsites,
  getWebsiteGroups, // 获取网站分组 (原 getGroups)
  getWebsiteById,
  getWebsiteGroupById, // 获取网站分组详情 (原 getGroupById)
  getWebsitesByGroupId,
  createWebsite,
  createWebsiteGroup, // 创建网站分组 (原 createGroup)
  updateWebsite,
  updateWebsiteGroup, // 更新网站分组 (原 updateGroup)
  deleteWebsite,
  deleteWebsiteGroup, // 删除网站分组 (原 deleteGroup)
  batchDeleteWebsites,
  getDockerContainers,
  batchMoveWebsites,
  reorderWebsiteGroups, // 重新排序网站分组 (原 reorderGroups)
  moveToTrash,
  batchImportWebsites,
  recordWebsiteClick,
  getDockerContainerById,
  addDockerContainer,
  editDockerContainer,
  deleteDockerContainer,
  getDockerGroups, // 获取 Docker 容器分组 (新增)
  getDockerGroupById, // 获取 Docker 容器分组详情 (新增)
  createDockerGroup, // 创建 Docker 容器分组 (新增)
  updateDockerGroup, // 更新 Docker 容器分组 (新增)
  deleteDockerGroup, // 删除 Docker 容器分组 (新增)
  reorderDockerGroups // 重新排序 Docker 容器分组 (新增)
};
