// backend/services/syncService.js
const { execSQL, queryOne, queryAll, batchExec } = require('../utils/fileHandler');

const MAX_BACKUP_VERSIONS = 5;
const ARCHIVE_SUCCESS_MESSAGE = 'Websites info archived successfully';

/**
 * 优雅地获取环境变量，支持 Cloudflare (env) 和 VPS (process.env)
 */
const getEnvVar = (env, key) => {
  // 优先从 Cloudflare env (c.env) 获取
  if (env && env[key]) {
    console.log(`[Sync] Found ${key} in env`);
    return env[key];
  }
  // 其次从 Node process.env 获取
  if (process.env && process.env[key]) {
    console.log(`[Sync] Found ${key} in process.env`);
    return process.env[key];
  }
  console.log(`[Sync] ${key} not found`);
  return null;
};

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

/**
 * 同步数据到 GitHub
 * 1. 导出全量数据
 * 2. 调用 GitHub API 更新文件
 */
const cloudSync = async (env) => {
  const token = getEnvVar(env, 'GITHUB_TOKEN');
  const repo = getEnvVar(env, 'GITHUB_REPO');
  const path = getEnvVar(env, 'GITHUB_PATH');

  if (!token || !repo || !path) {
    throw new Error('GitHub 配置不完整，请检查环境变量 GITHUB_TOKEN, GITHUB_REPO, GITHUB_PATH');
  }

  // 1. 获取数据
  const data = await exportData(env);
  const content = JSON.stringify(data, null, 2);
  // 兼容 Node.js (Buffer) 和 Cloudflare Workers (btoa)
  // 注意：btoa 不支持 Unicode，需要先编码
  let contentBase64;
  if (typeof Buffer !== 'undefined') {
    contentBase64 = Buffer.from(content).toString('base64');
  } else {
    // Cloudflare Workers / 现代浏览器
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(content);
    // 将 Uint8Array 转换为二进制字符串
    let binary = '';
    const bytes = new Uint8Array(uint8Array);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    contentBase64 = btoa(binary);
  }

  // 2. 解析 repo (owner/repo)
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error('GITHUB_REPO 格式错误，应为 owner/repo');
  }

  // 3. 生成带时间戳的文件路径
  // 例如: backup_json/backup.json -> backup_json/backup_20260322_185120.json
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const pathParts = path.split('/');
  const fileName = pathParts.pop();
  const dir = pathParts.join('/');

  // 提取文件名和扩展名
  const lastDotIndex = fileName.lastIndexOf('.');
  const baseName = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex) : '.json';

  const timestampedFileName = `${baseName}_${timestamp}${ext}`;
  const finalPath = dir ? `${dir}/${timestampedFileName}` : timestampedFileName;

  // 4. 获取文件 SHA (如果文件已存在)
  // 注意：这里我们不需要检查文件是否存在，因为每次都是新文件
  let sha = null;
  try {
    const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${finalPath}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'SiteBox-Backend'
      }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      sha = getData.sha;
    } else if (getResponse.status !== 404) {
      const errText = await getResponse.text();
      throw new Error(`获取 GitHub 文件信息失败: ${getResponse.status} ${errText}`);
    }
  } catch (e) {
    console.error('获取文件 SHA 失败', e);
    // 网络错误时尝试创建新文件
  }

  // 5. 更新或创建文件
  const putUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${finalPath}`;
  const putBody = {
    message: `Sync data from SiteBox ${new Date().toISOString()}`,
    content: contentBase64,
  };
  if (sha) {
    putBody.sha = sha;
  }

  const putResponse = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'SiteBox-Backend'
    },
    body: JSON.stringify(putBody)
  });

  if (!putResponse.ok) {
    const errText = await putResponse.text();
    throw new Error(`推送数据到 GitHub 失败: ${putResponse.status} ${errText}`);
  }

  return { message: `数据已成功同步到 GitHub: ${finalPath}` };
};

module.exports = {
  exportData,
  importData,
  restoreData,
  moveToTrash,
  backupData,
  listBackups,
  getHistory,
  cloudSync,
};
