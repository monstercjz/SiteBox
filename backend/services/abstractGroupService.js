'use strict';

// backend/services/abstractGroupService.js
const Group = require('../models/Group');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * @description 获取所有分组
 * @param {string} dataFilepath - 数据文件路径
 * @returns {Promise<Array<Group>>} 所有分组的数组
 */
const getAllGroups = async (dataFilepath) => {
  const data = await fileHandler.readData(dataFilepath);
  return (data.groups || [])
    .filter(group => typeof group.isCollapsible === 'boolean')
    .map(group => new Group(group.id, group.name, group.order, group.isCollapsible));
};

/**
 * @description 创建新的分组
 * @param {string} dataFilepath - 数据文件路径
 * @param {Object} groupData - 包含分组信息的对象
 * @param {string} groupData.name - 分组名称
 * @param {boolean} groupData.isCollapsible - 分组是否可折叠。
 * @returns {Promise<Group>} 新创建的分组
 */
const createGroup = async (dataFilepath, groupData) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    isCollapsible: Joi.boolean().required()
  });

  try {
    await schema.validateAsync(groupData);
    const data = await fileHandler.readData(dataFilepath);
    const newGroup = new Group(uuidv4(), groupData.name, data.nextGroupId, groupData.isCollapsible);
    data.groups = [...(data.groups || []), newGroup];
    data.nextGroupId = data.nextGroupId + 1;
    await fileHandler.writeData(dataFilepath, data);
    logger.info(`Group created: ${newGroup.id} - ${newGroup.name}`);
    return newGroup;
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    throw error;
  }
};

/**
 * @description 获取单个分组详情
 * @param {string} dataFilepath - 数据文件路径
 * @param {string} groupId - 分组ID
 * @returns {Promise<Group|undefined>} 返回指定ID的分组，如果不存在则返回 undefined
 */
const getGroupById = async (dataFilepath, groupId) => {
  const data = await fileHandler.readData(dataFilepath);
  const groupData = (data.groups || []).find((group) => group.id === groupId);
  return groupData ? new Group(groupData.id, groupData.name, groupData.order, groupData.isCollapsible) : undefined;
};

/**
 * @description 更新分组信息
 * @param {string} dataFilepath - 数据文件路径
 * @param {string} groupId - 要更新的分组ID
 * @param {Object} groupData - 包含更新后分组信息的对象
 * @param {string} groupData.name - 分组名称
 * @param {boolean} groupData.isCollapsible - 分组是否可折叠
 * @returns {Promise<Group|undefined>} 返回更新后的分组，如果不存在则返回 undefined
 */
const updateGroup = async (dataFilepath, groupId, groupData) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    isCollapsible: Joi.boolean().required()
  });

  try {
    await schema.validateAsync(groupData);
    const data = await fileHandler.readData(dataFilepath);
    const updatedGroups = (data.groups || []).map(group => {
      if (group.id === groupId) {
        return new Group(group.id, groupData.name, group.order, groupData.isCollapsible);
      }
      return group;
    });
    data.groups = updatedGroups;
    await fileHandler.writeData(dataFilepath, data);
    logger.info(`Group updated: ${groupId} - ${groupData.name}`);
    return updatedGroups.find(group => group.id === groupId);
  } catch (error) {
    logger.error(`Error updating group ${groupId}: ${error.message}`);
    throw error;
  }
};

/**
 * @description 删除分组
 * @param {string} dataFilepath - 数据文件路径
 * @param {string} groupId - 要删除的分组ID
 * @returns {Promise<{ message: string }>} 返回操作结果消息
 */
const deleteGroup = async (dataFilepath, groupId) => {
  try {
    const data = await fileHandler.readData(dataFilepath);
    let groups = (data.groups || []).filter((group) => group.id !== groupId);
    groups = groups.map((group, index) => new Group(group.id, group.name, index + 1, group.isCollapsible));
    data.groups = groups;
    await fileHandler.writeData(dataFilepath, data);
    logger.info(`Group deleted: ${groupId}`);
    return { message: 'Group deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting group ${groupId}: ${error.message}`);
    return { message: 'Failed to delete group' };
  }
};

/**
 * @description 分组排序
 * @param {string} dataFilepath - 数据文件路径
 * @param {Array<{id: string, order: number}>} reorderData - 包含分组ID和新顺序的数组
 * @returns {Promise<Array<Group|undefined>>} 返回排序后的分组数组
 */
const reorderGroups = async (dataFilepath, reorderData) => {
  const schema = Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    order: Joi.number().integer().required()
  })).required();

  try {
    await schema.validateAsync(reorderData);
    const data = await fileHandler.readData(dataFilepath);
    const groups = data.groups || [];
    const orderedGroups = reorderData.map(item => {
      const groupData = groups.find(group => group.id === item.id);
      return groupData ? new Group(groupData.id, groupData.name, item.order, groupData.isCollapsible) : undefined;
    });
    data.groups = orderedGroups;
    await fileHandler.writeData(dataFilepath, data);
    logger.info(`Groups reordered`);
    return orderedGroups;
  } catch (error) {
    logger.error(`Error reordering groups: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getAllGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  reorderGroups
};