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
 * 获取所有分组
 * @returns {Promise<any>} - 返回 Promise，解析为分组列表
 */
async function getGroups() {
  return fetchDataFromApi('/groups');
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
 * 获取单个分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为分组详情
 */
async function getGroupById(groupId) {
  return fetchDataFromApi(`/groups/${groupId}`);
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
 * 创建分组
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为新创建的分组
 */
async function createGroup(groupData) {
  return fetchDataFromApi('/groups', 'POST', groupData);
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
 * 更新分组
 * @param {string} groupId - 分组 ID
 * @param {object} groupData - 分组数据
 * @returns {Promise<any>} - 返回 Promise，解析为更新后的分组
 */
async function updateGroup(groupId, groupData) {
  return fetchDataFromApi(`/groups/${groupId}`, 'PUT', groupData);
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
 * 删除分组
 * @param {string} groupId - 分组 ID
 * @returns {Promise<any>} - 返回 Promise，解析为删除结果
 */
async function deleteGroup(groupId) {
  return fetchDataFromApi(`/groups/${groupId}`, 'DELETE');
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
 * 重新排序分组
 * @param {object[]} groups - 分组数组，包含 id 和 order 属性
 * @returns {Promise<any>} - 返回 Promise，解析为排序结果
 */
async function reorderGroups(groups) {
  return fetchDataFromApi('/groups/reorder', 'PATCH', groups);
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

export {
  fetchDataFromApi,
  getWebsites,
  getGroups,
  getWebsiteById,
  getGroupById,
  getWebsitesByGroupId,
  createWebsite,
  createGroup,
  updateWebsite,
  updateGroup,
  deleteWebsite,
  deleteGroup,
  batchDeleteWebsites,
  batchMoveWebsites,
  reorderGroups,
  moveToTrash,
  batchImportWebsites,
  recordWebsiteClick
};
