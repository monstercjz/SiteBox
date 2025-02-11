'use strict';

// backend/services/dockerGroupService.js
const abstractGroupService = require('./abstractGroupService');
const { DOCKER_GROUP_DATA_FILE_PATH } = require('../config/constants');

/**
 * @description 获取所有 Docker 容器分组
 * @returns {Promise<Array<Group>>} 所有 Docker 容器分组的数组
 */
const getAllGroups = async () => {
  return abstractGroupService.getAllGroups(DOCKER_GROUP_DATA_FILE_PATH);
};

/**
 * @description 创建新的 Docker 容器分组
 * @param {Object} groupData - 包含分组信息的对象
 * @param {string} groupData.name - 分组名称
 * @param {boolean} groupData.isCollapsible - 分组是否可折叠。
 * @returns {Promise<Group>} 新创建的 Docker 容器分组
 */
const createGroup = async (groupData) => {
  return abstractGroupService.createGroup(DOCKER_GROUP_DATA_FILE_PATH, groupData);
};

/**
 * @description 获取单个 Docker 容器分组详情
 * @param {string} groupId - 分组ID
 * @returns {Promise<Group|undefined>} 返回指定ID的 Docker 容器分组，如果不存在则返回 undefined
 */
const getGroupById = async (groupId) => {
  return abstractGroupService.getGroupById(DOCKER_GROUP_DATA_FILE_PATH, groupId);
};

/**
 * @description 更新 Docker 容器分组信息
 * @param {string} groupId - 要更新的分组ID
 * @param {Object} groupData - 包含更新后分组信息的对象
 * @param {string} groupData.name - 分组名称
 * @param {boolean} groupData.isCollapsible - 分组是否可折叠
 * @returns {Promise<Group|undefined>} 返回更新后的 Docker 容器分组，如果不存在则返回 undefined
 */
const updateGroup = async (groupId, groupData) => {
  return abstractGroupService.updateGroup(DOCKER_GROUP_DATA_FILE_PATH, groupId, groupData);
};

/**
 * @description 删除 Docker 容器分组
 * @param {string} groupId - 要删除的分组ID
 * @returns {Promise<{ message: string }>} 返回操作结果消息
 */
const deleteGroup = async (groupId) => {
  return abstractGroupService.deleteGroup(DOCKER_GROUP_DATA_FILE_PATH, groupId);
};

/**
 * @description Docker 容器分组排序
 * @param {Array<{id: string, order: number}>} reorderData - 包含分组ID和新顺序的数组
 * @returns {Promise<Array<Group|undefined>>} 返回排序后的 Docker 容器分组数组
 */
const reorderGroups = async (reorderData) => {
  return abstractGroupService.reorderGroups(DOCKER_GROUP_DATA_FILE_PATH, reorderData);
};

module.exports = {
  getAllGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  reorderGroups
};