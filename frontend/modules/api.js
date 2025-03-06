import { backendUrl } from '../config.js';

/**
 * 封装 fetch 函数，用于发送 API 请求
 * @param {string} url - 请求 URL
 * @param {string} [method='GET'] - 请求方法
 * @param {object} [body=null] - 请求体
 * @returns {Promise<any>}- 返回 Promise，解析为 API 返回的数据
 * @throws {Error} - 如果 API 请求失败
 */
async function fetchDataFromApi(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  // console.log('fetchDataFromApi', url, method, body);
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
 * @returns {Promise<any>}- 返回 Promise，解析为网站列表
 */
async function getWebsites() {
  return fetchDataFromApi('/websites');
}

/**
 * 获取所有网站分组
 * @returns {Promise<any>}- 返回 Promise，解析为网站分组列表
 */
async function getWebsiteGroups() {
  return fetchDataFromApi('/website-groups'); // 网站分组路由保持不变
}

/**
 * 获取所有 Docker 容器分组
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 容器分组列表
 */
async function getDockerGroups() {
  return fetchDataFromApi('/docker-groups'); // Docker 容器分组使用新路由
}

/**
 * 获取单个网站
 * @param {string} websiteId - 网站 ID
 * @returns {Promise<any>}- 返回 Promise，解析为网站详情
 */
async function getWebsiteById(websiteId) {
  return fetchDataFromApi(`/websites/${websiteId}`);
}

/**
 * 获取单个网站分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为网站分组详情
 */
async function getWebsiteGroupById(groupId) {
  return fetchDataFromApi(`/website-groups/${groupId}`); // 网站分组路由保持不变
}

/**
 * 获取单个 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 容器分组详情
 */
async function getDockerGroupById(groupId) {
  return fetchDataFromApi(`/docker-groups/${groupId}`); // Docker 容器分组使用新路由
}

/**
 * 获取某个分组下的所有网站
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为网站列表
 */
async function getWebsitesByGroupId(groupId) {
  return fetchDataFromApi(`/websites/groups/${groupId}/websites`);
}

/**
 * 创建网站
 * @param {string} groupId - 分组 ID
 * @param {object} websiteData - 网站数据
 * @returns {Promise<any>}- 返回 Promise，解析为新创建的网站
 */
async function createWebsite(groupId, websiteData) {
  return fetchDataFromApi(`/websites/groups/${groupId}/websites`, 'POST', websiteData);
}

/**
 * 创建网站分组
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>}- 返回 Promise，解析为新创建的网站分组
 */
async function createWebsiteGroup(groupData) {
  return fetchDataFromApi('/website-groups', 'POST', groupData); // 网站分组路由保持不变
}

/**
 * 创建 Docker 容器分组
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>}- 返回 Promise，解析为新创建的 Docker 容器分组
 */
async function createDockerGroup(groupData) {
  return fetchDataFromApi('/docker-groups', 'POST', groupData); // Docker 容器分组使用新路由
}

/**
 * 更新网站
 * @param {string} websiteId - 网站 ID
 * @param {object} websiteData - 网站数据
 * @returns {Promise<any>}- 返回 Promise，解析为更新后的网站
 */
async function updateWebsite(websiteId, websiteData) {
  return fetchDataFromApi(`/websites/${websiteId}`, 'PUT', websiteData);
}

/**
 * 更新网站分组
 * @param {string} groupId - 分组 ID
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>}- 返回 Promise，解析为更新后的网站分组
 */
async function updateWebsiteGroup(groupId, groupData) {
  return fetchDataFromApi(`/website-groups/${groupId}`, 'PUT', groupData); // 网站分组路由保持不变
}

/**
 * 更新 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>}- 返回 Promise，解析为更新后的 Docker 容器分组
 */
async function updateDockerGroup(groupId, groupData) {
  return fetchDataFromApi(`/docker-groups/${groupId}`, 'PUT', groupData); // Docker 容器分组使用新路由
}

/**
 * 删除网站
 * @param {string} websiteId - 网站 ID
 * @returns {Promise<any>}- 返回 Promise，解析为删除结果
 */
async function deleteWebsite(websiteId) {
  return fetchDataFromApi(`/websites/${websiteId}`, 'DELETE');
}

/**
 * 删除网站分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为删除结果
 */
async function deleteWebsiteGroup(groupId) {
  return fetchDataFromApi(`/website-groups/${groupId}`, 'DELETE'); // 网站分组路由保持不变
}

/**
 * 删除 Docker 容器分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为删除结果
 */
async function deleteDockerGroup(groupId) {
  return fetchDataFromApi(`/docker-groups/${groupId}`, 'DELETE'); // Docker 容器分组使用新路由
}

/**
 * 批量删除网站
 * @param {string[]} websiteIds - 网站 ID 数组
 * @returns {Promise<any>}- 返回 Promise，解析为删除结果
 */
async function batchDeleteWebsites(websiteIds) {
  return fetchDataFromApi('/websites/batch', 'DELETE', { websiteIds });
}

/**
 * 批量移动网站
 * @param {string[]} websiteIds - 网站 ID 数组
 * @param {string} targetGroupId - 目标分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为移动结果
 */
async function batchMoveWebsites(websiteIds, targetGroupId) {
  return fetchDataFromApi('/websites/batch-move', 'PATCH', { websiteIds, targetGroupId });
}

/**
 * 重新排序网站分组
 * @param {object[]} groups - 分组数组，包含 id 和 order 属性
 * @returns {Promise<any>}- 返回 Promise，解析为排序结果
 */
async function reorderWebsiteGroups(groups) {
  return fetchDataFromApi('/website-groups/reorder', 'PATCH', groups); // 网站分组路由保持不变
}

/**
 * 重新排序 Docker 容器分组
 * @param {object[]} groups - 分组数组，包含 id 和 order 属性
 * @returns {Promise<any>}- 返回 Promise，解析为排序结果
 */
async function reorderDockerGroups(groups) {
  return fetchDataFromApi('/docker-groups/reorder', 'PATCH', groups); // Docker 容器分组使用新路由
}

/**
 * 移动网站到回收站
 * @param {string|string[]} websiteIds - 网站 ID 或网站 ID 数组
 * @returns {Promise<any>}- 返回 Promise，解析为移动结果
 */
async function moveToTrash(websiteIds) {
  return fetchDataFromApi('/sync/moveToTrash', 'POST', { websiteIds });
}

/**
 * 批量导入网站
 * @param {Array} websites - 网站数据数组
 * @param {string} groupId - 分组ID
 * @returns {Promise<any>}- 返回 Promise，解析为导入结果
 */
async function batchImportWebsites(websites, groupId) {
  return fetchDataFromApi('/websites/batchImportWebsites', 'POST', { websites, groupId });
}

/**
 * 记录网站点击时间
 * @param {string} websiteId - 网站ID
 * @returns {Promise<any>}- 返回 Promise，解析为记录结果
 */
async function recordWebsiteClick(websiteId) {
  return fetchDataFromApi('/analytics/click', 'POST', { websiteId });
}
/**
 * 获取所有 Docker 记录
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 记录列表
 */
async function getAllDockers() {
  return fetchDataFromApi('/dockers');
}

/**
 * 获取某个分组下的所有 Docker 记录
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 记录列表
 */
async function getDockersByGroupId(groupId) {
  return fetchDataFromApi(`/dockers/groups/${groupId}/dockers`);
}

/**
 * 创建 Docker 记录
 * @param {string} groupId - 分组 ID
 * @param {object} dockerData - Docker 记录数据
 * @returns {Promise<any>}- 返回 Promise，解析为新创建的 Docker 记录
 */
async function createDocker(groupId, dockerData) {
  return fetchDataFromApi(`/dockers/groups/${groupId}/dockers`, 'POST', dockerData);
}

/**
 * 获取单个 Docker 记录详情
 * @param {string} dockerId - Docker 记录 ID
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 记录详情
 */
async function getDockerById(dockerId) {
  return fetchDataFromApi(`/dockers/${dockerId}`);
}

/**
 * 更新 Docker 记录
 * @param {string} dockerId - Docker 记录 ID
 * @param {object} dockerData - Docker 记录数据
 * @returns {Promise<any>}- 返回 Promise，解析为更新后的 Docker 记录
 */
async function updateDocker(dockerId, dockerData) {
  return fetchDataFromApi(`/dockers/${dockerId}`, 'PUT', dockerData);
}

/**
 * 删除 Docker 记录
 * @param {string} dockerId - Docker 记录 ID
 * @returns {Promise<any>}- 返回 Promise，解析为删除结果
 */
async function deleteDocker(dockerId) {
  return fetchDataFromApi(`/dockers/${dockerId}`, 'DELETE');
}

/**
 * 获取所有 Docker 容器实时信息
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 容器实时信息列表
 */
async function getRealdockerinfo() {
  return fetchDataFromApi('/dockers/realdockerinfo');
}

/**
 * 获取单个 Docker 容器实时信息
 * @param {string} dockerId - Docker 记录 ID
 * @returns {Promise<any>}- 返回 Promise，解析为 Docker 容器实时信息详情
 */
async function getRealdockerinfobyId(dockerId) {
  return fetchDataFromApi(`/dockers/realdockerinfobyId/${dockerId}`);
}
/**
 * 启动 Docker 容器
 * @param {string} dockerId - Docker 容器 ID
 * @returns {Promise<any>}
 */
async function startDockerContainer(dockerId) {
  return fetchDataFromApi(`/dockers/${dockerId}/start`, 'POST');
}

/**
 * 停止 Docker 容器
 * @param {string} dockerId - Docker 容器 ID
 * @returns {Promise<any>}
 */
async function stopDockerContainer(dockerId) {
  return fetchDataFromApi(`/dockers/${dockerId}/stop`, 'POST');
}

/**
 * 重启 Docker 容器
 * @param {string} dockerId - Docker 容器 ID
 * @returns {Promise<any>}
 */
async function restartDockerContainer(dockerId) {
  return fetchDataFromApi(`/dockers/${dockerId}/restart`, 'POST');
}
async function updateSiteName(newSiteName) {
  return fetchDataFromApi(`/misc/siteName`, 'POST', { newSiteName });
}
async function getSiteName() {
  return fetchDataFromApi(`/misc/gettings/siteName`, 'GET');
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
  batchMoveWebsites,
  reorderWebsiteGroups, // 重新排序网站分组 (原 reorderGroups)
  moveToTrash,
  batchImportWebsites,
  recordWebsiteClick,
  getDockerGroups, // 获取 Docker 容器分组 (新增)
  getDockerGroupById, // 获取 Docker 容器分组详情 (新增)
  createDockerGroup, // 创建 Docker 容器分组 (新增)
  updateDockerGroup, // 更新 Docker 容器分组 (新增)
  deleteDockerGroup, // 删除 Docker 容器分组 (新增)
  reorderDockerGroups, // 重新排序 Docker 容器分组 (新增)
  getAllDockers,
  getDockersByGroupId,
  createDocker,
  getDockerById,
  updateDocker,
  deleteDocker,
  getRealdockerinfo,
  getRealdockerinfobyId,
  startDockerContainer,
  stopDockerContainer,
  restartDockerContainer,
  updateSiteName,
  getSiteName,
};


