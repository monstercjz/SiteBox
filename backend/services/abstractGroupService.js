'use strict';

// backend/services/abstractGroupService.js
const Group = require('../models/Group');
const { execSQL, queryOne, queryAll, batchExec } = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../utils/logger');
const { WEBSITE_GROUP_TYPE, DOCKER_GROUP_TYPE, WEBSITE_DASHBOARD_TYPE, DOCKER_DASHBOARD_TYPE } = require('../config/constants');

/**
 * 将数据库行转换为 Group 对象
 */
const rowToGroup = (row) => {
  return new Group(
    row.id,
    row.name,
    row.order_index,
    !!row.is_collapsible,
    row.group_type,
    row.dashboard_type
  );
};

/**
 * 获取所有分组（按 groupType 过滤）
 */
const getAllGroups = async (env, groupType) => {
  const rows = await queryAll(env, 'SELECT * FROM groups WHERE group_type = ? ORDER BY order_index ASC', [groupType]);
  return rows.map(rowToGroup);
};

/**
 * 创建新分组
 */
const createGroup = async (env, groupType, groupData) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    isCollapsible: Joi.boolean().required(),
    dashboardType: Joi.string().valid(WEBSITE_DASHBOARD_TYPE, DOCKER_DASHBOARD_TYPE).required(),
    groupType: Joi.string().valid(WEBSITE_GROUP_TYPE, DOCKER_GROUP_TYPE).required(),
  });

  try {
    await schema.validateAsync(groupData);

    // 计算当前最大 order_index
    const maxRow = await queryOne(env, 'SELECT MAX(order_index) as max_order FROM groups WHERE group_type = ?', [groupType]);
    const nextOrder = (maxRow && maxRow.max_order !== null) ? maxRow.max_order + 1 : 1;

    const newGroup = new Group(uuidv4(), groupData.name, nextOrder, groupData.isCollapsible, groupData.groupType, groupData.dashboardType);

    await execSQL(env,
      'INSERT INTO groups (id, name, order_index, is_collapsible, group_type, dashboard_type) VALUES (?, ?, ?, ?, ?, ?)',
      [newGroup.id, newGroup.name, newGroup.order, newGroup.isCollapsible ? 1 : 0, newGroup.groupType, newGroup.dashboardType]
    );

    logger.info(`Group created: ${newGroup.id} - ${newGroup.name}`);
    return newGroup;
  } catch (error) {
    logger.error(`Error creating group: ${error.message}`);
    throw error;
  }
};

/**
 * 获取单个分组详情
 */
const getGroupById = async (env, groupId) => {
  const row = await queryOne(env, 'SELECT * FROM groups WHERE id = ?', [groupId]);
  return row ? rowToGroup(row) : undefined;
};

/**
 * 更新分组信息
 */
const updateGroup = async (env, groupId, groupData) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    isCollapsible: Joi.boolean().required(),
    dashboardType: Joi.string().valid(WEBSITE_DASHBOARD_TYPE, DOCKER_DASHBOARD_TYPE).optional(),
    groupType: Joi.string().valid(WEBSITE_GROUP_TYPE, DOCKER_GROUP_TYPE).optional(),
  });

  try {
    await schema.validateAsync(groupData);

    const existing = await queryOne(env, 'SELECT * FROM groups WHERE id = ?', [groupId]);
    if (!existing) return undefined;

    const dashboardType = groupData.dashboardType || existing.dashboard_type;

    await execSQL(env,
      'UPDATE groups SET name = ?, is_collapsible = ?, dashboard_type = ? WHERE id = ?',
      [groupData.name, groupData.isCollapsible ? 1 : 0, dashboardType, groupId]
    );

    logger.info(`Group updated: ${groupId} - ${groupData.name}`);
    return await getGroupById(env, groupId);
  } catch (error) {
    logger.error(`Error updating group ${groupId}: ${error.message}`);
    throw error;
  }
};

/**
 * 删除分组
 */
const deleteGroup = async (env, groupId) => {
  try {
    await execSQL(env, 'DELETE FROM groups WHERE id = ?', [groupId]);
    logger.info(`Group deleted: ${groupId}`);
    return { message: 'Group deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting group ${groupId}: ${error.message}`);
    return { message: 'Failed to delete group' };
  }
};

/**
 * 分组排序（批量更新 order_index）
 */
const reorderGroups = async (env, reorderData) => {
  const schema = Joi.array().items(Joi.object({
    id: Joi.string().uuid().required(),
    order: Joi.number().integer().required(),
    dashboardType: Joi.string().valid(WEBSITE_DASHBOARD_TYPE, DOCKER_DASHBOARD_TYPE).optional(),
  })).required();

  try {
    await schema.validateAsync(reorderData);

    const statements = reorderData.map((item) => {
      if (item.dashboardType) {
        return {
          sql: 'UPDATE groups SET order_index = ?, dashboard_type = ? WHERE id = ?',
          params: [item.order, item.dashboardType, item.id],
        };
      }
      return {
        sql: 'UPDATE groups SET order_index = ? WHERE id = ?',
        params: [item.order, item.id],
      };
    });

    await batchExec(env, statements);

    logger.info('Groups reordered');

    // 返回更新后的分组列表
    const ids = reorderData.map(item => item.id);
    const placeholders = ids.map(() => '?').join(',');
    const rows = await queryAll(env, `SELECT * FROM groups WHERE id IN (${placeholders}) ORDER BY order_index ASC`, ids);
    return rows.map(rowToGroup);
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
  reorderGroups,
};
