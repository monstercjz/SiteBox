'use strict';

// backend/services/websiteService.js
const Website = require('../models/Website');
const { execSQL, queryOne, queryAll, batchExec } = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const { getGroupById } = require('./websiteGroupService');
const logger = require('../utils/logger');
const { fetchFavicon } = require('../utils/faviconUtils');
const syncService = require('./syncService');

/**
 * 将数据库行转换为 Website 对象
 */
const rowToWebsite = (row) => {
  return new Website(
    row.id,
    row.group_id,
    row.name,
    row.url,
    row.description,
    row.favicon_url,
    row.last_access_time,
    row.order_index,
    !!row.is_accessible
  );
};

const handleServiceError = (error, message) => {
  console.error(`${message}:`, error.message || error);
  throw new Error(`${message}: ${error.message || error}`);
};

const CREATE_WEBSITE_SCHEMA = Joi.object({
  groupId: Joi.string().uuid().required(),
  websiteData: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    description: Joi.string().allow('').optional(),
    faviconUrl: Joi.string().optional(),
  }).required(),
});

const UPDATE_WEBSITE_SCHEMA = Joi.object({
  websiteId: Joi.string().uuid().required(),
  websiteData: Joi.object({
    groupId: Joi.string().uuid().optional(),
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    description: Joi.string().allow('').optional(),
    faviconUrl: Joi.string().optional(),
    order: Joi.number().integer().optional(),
    isAccessible: Joi.boolean().optional(),
  }).required(),
});

/**
 * 获取所有网站记录
 */
const getAllWebsites = async (env) => {
  try {
    const rows = await queryAll(env, 'SELECT * FROM websites ORDER BY order_index ASC');
    logger.info(`获取所有网站，共 ${rows.length} 条`);
    return rows.map(rowToWebsite);
  } catch (error) {
    handleServiceError(error, '获取所有网站记录失败');
  }
};

/**
 * 获取指定分组下的所有网站
 */
const getWebsitesByGroupId = async (env, groupId) => {
  const schema = Joi.string().uuid().required();
  try {
    await schema.validateAsync(groupId);
  } catch (error) {
    handleServiceError(error, '无效的 groupId');
  }

  const group = await getGroupById(env, groupId);
  if (!group) {
    handleServiceError(new Error('指定的分组不存在'), '获取网站记录失败');
  }

  try {
    const rows = await queryAll(env, 'SELECT * FROM websites WHERE group_id = ? ORDER BY order_index ASC', [groupId]);
    logger.info(`获取分组 ${groupId} 的网站，共 ${rows.length} 条`);
    return rows.map(rowToWebsite);
  } catch (error) {
    handleServiceError(error, '获取网站记录失败');
  }
};

/**
 * 获取单个网站
 */
const getWebsiteById = async (env, websiteId) => {
  const schema = Joi.string().uuid().required();
  try {
    await schema.validateAsync(websiteId);
  } catch (error) {
    handleServiceError(error, '无效的 websiteId');
  }
  const row = await queryOne(env, 'SELECT * FROM websites WHERE id = ?', [websiteId]);
  if (row) {
    logger.info(`获取网站 ID: ${websiteId}`);
    return rowToWebsite(row);
  }
  logger.warn(`未找到网站 ID: ${websiteId}`);
  return undefined;
};

/**
 * 创建新网站
 */
const createWebsite = async (env, groupId, websiteData) => {
  try {
    await CREATE_WEBSITE_SCHEMA.validateAsync({ groupId, websiteData });
  } catch (error) {
    handleServiceError(error, '无效的网站数据');
  }

  const group = await getGroupById(env, groupId);
  if (!group) {
    handleServiceError(new Error('指定的分组不存在'), '创建网站记录失败');
  }

  try {
    // 检查 URL 是否重复
    const existing = await queryOne(env, 'SELECT id FROM websites WHERE url = ?', [websiteData.url]);
    if (existing) {
      handleServiceError(new Error('该网站 URL 已存在'), '创建网站记录失败');
    }

    // 获取分组内当前最大 order
    const maxRow = await queryOne(env, 'SELECT MAX(order_index) as max_order FROM websites WHERE group_id = ?', [groupId]);
    const nextOrder = (maxRow && maxRow.max_order !== null) ? maxRow.max_order + 1 : 1;

    const faviconUrl = await fetchFavicon(websiteData.url, websiteData.faviconUrl);
    const newWebsite = new Website(
      uuidv4(), groupId, websiteData.name, websiteData.url,
      websiteData.description || '', faviconUrl, new Date().toISOString(), nextOrder, true
    );

    await execSQL(env,
      'INSERT INTO websites (id, group_id, name, url, description, favicon_url, last_access_time, order_index, is_accessible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newWebsite.id, newWebsite.groupId, newWebsite.name, newWebsite.url, newWebsite.description, newWebsite.faviconUrl, newWebsite.lastAccessTime, newWebsite.order, newWebsite.isAccessible ? 1 : 0]
    );

    logger.info(`创建新网站: ${newWebsite.name} (ID: ${newWebsite.id})`);
    return newWebsite;
  } catch (error) {
    if (error.message && error.message.includes('创建网站记录失败')) throw error;
    handleServiceError(error, '创建网站记录失败');
  }
};

/**
 * 更新网站
 */
const updateWebsite = async (env, websiteId, websiteData) => {
  try {
    await UPDATE_WEBSITE_SCHEMA.validateAsync({ websiteId, websiteData });
  } catch (error) {
    handleServiceError(error, '无效的网站数据');
  }

  try {
    const existing = await queryOne(env, 'SELECT * FROM websites WHERE id = ?', [websiteId]);
    if (!existing) {
      handleServiceError(new Error('找不到指定的网站'), '更新网站记录失败');
    }

    // 检查新 URL 是否与其他网站重复
    const duplicateUrl = await queryOne(env, 'SELECT id FROM websites WHERE url = ? AND id != ?', [websiteData.url, websiteId]);
    if (duplicateUrl) {
      handleServiceError(new Error('该网站 URL 已存在'), '更新网站记录失败');
    }

    // favicon 处理：若传入自定义 favicon 则用，否则检查 hostname 是否变化
    let updatedFaviconUrl = websiteData.faviconUrl;
    if (!updatedFaviconUrl) {
      const currentHostname = new URL(websiteData.url).hostname;
      if (!existing.favicon_url || !existing.favicon_url.includes(currentHostname)) {
        updatedFaviconUrl = await fetchFavicon(websiteData.url);
      } else {
        updatedFaviconUrl = existing.favicon_url;
      }
    }

    const groupId = websiteData.groupId || existing.group_id;
    const orderIndex = websiteData.order !== undefined ? websiteData.order : existing.order_index;
    const isAccessible = websiteData.isAccessible !== undefined ? websiteData.isAccessible : !!existing.is_accessible;

    await execSQL(env,
      'UPDATE websites SET group_id = ?, name = ?, url = ?, description = ?, favicon_url = ?, order_index = ?, is_accessible = ? WHERE id = ?',
      [groupId, websiteData.name, websiteData.url, websiteData.description || '', updatedFaviconUrl, orderIndex, isAccessible ? 1 : 0, websiteId]
    );

    logger.info(`更新网站: ${websiteData.name} (ID: ${websiteId})`);
    return await getWebsiteById(env, websiteId);
  } catch (error) {
    if (error.message && error.message.includes('更新网站记录失败')) throw error;
    handleServiceError(error, '更新网站记录失败');
  }
};

/**
 * 删除网站
 */
const deleteWebsite = async (env, websiteId) => {
  const schema = Joi.string().uuid().required();
  try {
    await schema.validateAsync(websiteId);
  } catch (error) {
    handleServiceError(error, '无效的 websiteId');
  }

  const existing = await queryOne(env, 'SELECT * FROM websites WHERE id = ?', [websiteId]);
  await execSQL(env, 'DELETE FROM websites WHERE id = ?', [websiteId]);

  if (existing) {
    logger.info(`删除网站: ${existing.name} (ID: ${websiteId})`);
    return { message: 'Website deleted successfully' };
  } else {
    logger.warn(`尝试删除不存在的网站 ID: ${websiteId}`);
    return { message: 'Website not found' };
  }
};

/**
 * 网站排序
 * @param {Object} env - 环境变量
 * @param {Array<{id: string}>} reorderData - 排序数据，包含网站ID数组
 * @returns {Promise<Array>} 更新后的网站列表
 */
const reorderWebsites = async (env, reorderData) => {
  const schema = Joi.array().items(Joi.object({ id: Joi.string().uuid().required() })).required();
  try {
    await schema.validateAsync(reorderData);
  } catch (error) {
    handleServiceError(error, '无效的排序数据');
  }

  // 分批执行更新，每批最多 100 条，避免 SQLite 变量数量限制
  const BATCH_SIZE = 100;
  for (let i = 0; i < reorderData.length; i += BATCH_SIZE) {
    const batch = reorderData.slice(i, i + BATCH_SIZE);
    const statements = batch.map((item, index) => ({
      sql: 'UPDATE websites SET order_index = ? WHERE id = ?',
      params: [i + index + 1, item.id],
    }));
    await batchExec(env, statements);
  }
  logger.info(`重新排序网站，共 ${reorderData.length} 条`);

  // 分批查询网站，每批最多 100 个 ID，避免 IN 子句变量数量限制
  const allRows = [];
  const ids = reorderData.map(item => item.id);
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const placeholders = batchIds.map(() => '?').join(',');
    const rows = await queryAll(env, `SELECT * FROM websites WHERE id IN (${placeholders}) ORDER BY order_index ASC`, batchIds);
    allRows.push(...rows);
  }
  return allRows.map(rowToWebsite);
};

/**
 * 批量删除网站
 */
const batchDeleteWebsites = async (env, websiteIds) => {
  const schema = Joi.array().items(Joi.string().uuid().required()).required();
  if (!websiteIds || websiteIds.length === 0) return 0;

  try {
    await schema.validateAsync(websiteIds);
  } catch (error) {
    handleServiceError(error, '无效的网站 ID 列表');
  }

  const statements = websiteIds.map(id => ({
    sql: 'DELETE FROM websites WHERE id = ?',
    params: [id],
  }));

  await batchExec(env, statements);
  logger.info(`批量删除网站，共 ${websiteIds.length} 条`);
  return websiteIds.length;
};

/**
 * 批量移动网站到其他分组
 */
const batchMoveWebsites = async (env, websiteIds, targetGroupId) => {
  const schema = Joi.object({
    websiteIds: Joi.array().items(Joi.string().uuid().required()).required(),
    targetGroupId: Joi.string().uuid().required(),
  });
  try {
    await schema.validateAsync({ websiteIds, targetGroupId });
  } catch (error) {
    handleServiceError(error, '无效的参数');
  }

  const group = await getGroupById(env, targetGroupId);
  if (!group) {
    handleServiceError(new Error('指定的目标分组不存在'), '批量移动网站失败');
  }

  const statements = websiteIds.map(id => ({
    sql: 'UPDATE websites SET group_id = ? WHERE id = ?',
    params: [targetGroupId, id],
  }));

  await batchExec(env, statements);
  logger.info(`批量移动 ${websiteIds.length} 条网站到分组: ${targetGroupId}`);
  return websiteIds.length;
};

/**
 * 批量导入网站
 */
const batchImportWebsites = async (env, websites, groupId) => {
  try {
    await syncService.backupData(env);

    const maxRow = await queryOne(env, 'SELECT MAX(order_index) as max_order FROM websites WHERE group_id = ?', [groupId]);
    const baseOrder = (maxRow && maxRow.max_order !== null) ? maxRow.max_order : 0;

    const statements = websites.map((website, index) => ({
      sql: 'INSERT INTO websites (id, group_id, name, url, description, favicon_url, last_access_time, order_index, is_accessible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        uuidv4(),
        groupId.toString(),
        website.name || '',
        website.url || '',
        website.description || '',
        `https://icons.duckduckgo.com/ip3/${(() => { try { return new URL(website.url).hostname; } catch { return ''; } })()}.ico`,
        new Date().toISOString(),
        baseOrder + index + 1,
        1,
      ],
    }));

    await batchExec(env, statements);
    return { success: true, count: websites.length };
  } catch (error) {
    handleServiceError(error, '批量导入网站失败');
  }
};

module.exports = {
  getAllWebsites,
  getWebsitesByGroupId,
  getWebsiteById,
  createWebsite,
  updateWebsite,
  deleteWebsite,
  reorderWebsites,
  batchDeleteWebsites,
  batchMoveWebsites,
  batchImportWebsites,
};
