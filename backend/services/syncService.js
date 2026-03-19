// backend/services/syncService.js
const { execSQL, queryOne, queryAll, batchExec } = require('../utils/fileHandler');

const MAX_BACKUP_VERSIONS = 5;
const ARCHIVE_SUCCESS_MESSAGE = 'Websites info archived successfully';

/**
 * 将 groups + websites + dockers 全量数据导出为 JSON
 */
const exportData = async (env) => {
  const groups = await queryAll(env, 'SELECT * FROM groups ORDER BY order_index ASC');
  const websites = await queryAll(env, 'SELECT * FROM websites ORDER BY order_index ASC');
  const dockers = await queryAll(env, 'SELECT * FROM dockers ORDER BY created_at ASC');

  return { groups, websites, dockers };
};

const normalizeGroups = (data) => {
  if (Array.isArray(data.groups)) return data.groups;
  const websiteGroups = Array.isArray(data.websiteGroups) ? data.websiteGroups : [];
  const dockerGroups = Array.isArray(data.dockerGroups) ? data.dockerGroups : [];
  return [...websiteGroups, ...dockerGroups];
};

/**
 * 导入数据（先备份，再清空，再插入）
 */
const importData = async (env, importedData) => {
  await backupData(env);

  const groups = normalizeGroups(importedData || {});
  const websites = Array.isArray(importedData?.websites) ? importedData.websites : [];
  const dockers = Array.isArray(importedData?.dockers) ? importedData.dockers : [];

  const statements = [];

  // 清空所有表
  statements.push({ sql: 'DELETE FROM dockers', params: [] });
  statements.push({ sql: 'DELETE FROM websites', params: [] });
  statements.push({ sql: 'DELETE FROM groups', params: [] });

  // 插入 groups
  for (const g of groups) {
    statements.push({
      sql: 'INSERT OR REPLACE INTO groups (id, name, order_index, is_collapsible, group_type, dashboard_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [
        g.id,
        g.name,
        g.order_index ?? g.order ?? 0,
        g.is_collapsible ?? (typeof g.isCollapsible === 'boolean' ? (g.isCollapsible ? 1 : 0) : 1),
        g.group_type ?? g.groupType,
        g.dashboard_type ?? g.dashboardType,
        g.created_at || g.createdAt || new Date().toISOString(),
      ],
    });
  }

  // 插入 websites
  for (const w of websites) {
    statements.push({
      sql: 'INSERT OR REPLACE INTO websites (id, group_id, name, url, description, favicon_url, last_access_time, order_index, is_accessible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        w.id,
        w.group_id ?? w.groupId,
        w.name,
        w.url,
        w.description ?? '',
        w.favicon_url ?? w.faviconUrl ?? '',
        w.last_access_time ?? w.lastAccessTime ?? null,
        w.order_index ?? w.order ?? 0,
        w.is_accessible ?? (typeof w.isAccessible === 'boolean' ? (w.isAccessible ? 1 : 0) : 1),
      ],
    });
  }

  // 插入 dockers
  for (const d of dockers) {
    statements.push({
      sql: 'INSERT OR REPLACE INTO dockers (id, group_id, name, display_name, url, url_port, description, server, server_port, favicon_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [
        d.id,
        d.group_id ?? d.groupId,
        d.name,
        d.display_name ?? d.displayName ?? d.name,
        d.url ?? '',
        d.url_port ?? d.urlPort ?? null,
        d.description ?? '',
        d.server,
        d.server_port ?? d.serverPort,
        d.favicon_url ?? d.faviconUrl ?? '',
        d.created_at || d.createdAt || new Date().toISOString(),
        d.updated_at || d.updatedAt || new Date().toISOString(),
      ],
    });
  }

  await batchExec(env, statements);
};

/**
 * 恢复到指定备份版本
 */
const restoreData = async (env, backupId) => {
  const backup = await queryOne(env, 'SELECT * FROM backups WHERE id = ?', [backupId]);
  if (!backup) {
    throw new Error('备份版本不存在');
  }

  let data;
  try {
    data = JSON.parse(backup.data);
  } catch {
    throw new Error('备份数据损坏，无法解析');
  }

  await importData(env, data);
  return { message: '数据已恢复到备份版本', backupId };
};

/**
 * 移入回收站（记录到 history 表，并从 websites 表删除）
 */
const moveToTrash = async (env, websiteIds) => {
  const idsArray = Array.isArray(websiteIds) ? websiteIds : [websiteIds];

  const statements = [];

  for (const id of idsArray) {
    const website = await queryOne(env, 'SELECT * FROM websites WHERE id = ?', [id]);
    if (!website) {
      console.error(`Website with id ${id} not found`);
      continue;
    }
    const websiteInfo = `${website.name}+${website.url}+${website.description}`;
    statements.push({
      sql: 'INSERT INTO history (website_info, created_at) VALUES (?, ?)',
      params: [websiteInfo, new Date().toISOString()],
    });
    statements.push({
      sql: 'DELETE FROM websites WHERE id = ?',
      params: [id],
    });
  }

  if (statements.length > 0) {
    await batchExec(env, statements);
  }

  return { message: ARCHIVE_SUCCESS_MESSAGE };
};

/**
 * 备份当前数据到 backups 表，最多保留 MAX_BACKUP_VERSIONS 条
 */
const backupData = async (env) => {
  try {
    const data = await exportData(env);
    const json = JSON.stringify(data);
    const now = new Date().toISOString();

    await execSQL(env, 'INSERT INTO backups (data, created_at) VALUES (?, ?)', [json, now]);

    // 清理超量备份（保留最新的 MAX_BACKUP_VERSIONS 条）
    const allBackups = await queryAll(env, 'SELECT id FROM backups ORDER BY id DESC');
    if (allBackups.length > MAX_BACKUP_VERSIONS) {
      const toDelete = allBackups.slice(MAX_BACKUP_VERSIONS);
      const deleteStatements = toDelete.map((b) => ({
        sql: 'DELETE FROM backups WHERE id = ?',
        params: [b.id],
      }));
      await batchExec(env, deleteStatements);
    }

    console.log('Data backed up successfully at', now);
  } catch (error) {
    console.error('Error backing up data:', error);
    throw error;
  }
};

/**
 * 获取所有备份列表（不含数据内容，只返回 id 和 created_at）
 */
const listBackups = async (env) => {
  const rows = await queryAll(env, 'SELECT id, created_at FROM backups ORDER BY id DESC');
  return rows;
};

/**
 * 获取历史（回收站）记录
 */
const getHistory = async (env) => {
  const rows = await queryAll(env, 'SELECT * FROM history ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    websiteInfo: r.website_info,
    createdAt: r.created_at,
  }));
};

module.exports = {
  exportData,
  importData,
  restoreData,
  moveToTrash,
  backupData,
  listBackups,
  getHistory,
};
