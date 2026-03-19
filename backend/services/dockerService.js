// backend/services/dockerService.js
const { execSQL, queryOne, queryAll } = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../utils/logger');
const { processFavicon, DEFAULT_DOCKER_ICON_URL } = require('../utils/dockerfavicon.js');

const IS_CF_MODE = process.env.DEPLOY_MODE === 'cloudflare';

// Joi 校验规则
const CREATE_DOCKER_SCHEMA = Joi.object({
  groupId: Joi.string().uuid().required(),
  dockerData: Joi.object({
    name: Joi.string().required(),
    displayName: Joi.string().min(3).max(50).optional().default(Joi.ref('name')),
    url: Joi.string().optional().allow(''),
    urlPort: Joi.number().port().allow('').empty('').optional(),
    description: Joi.string().allow('').optional(),
    server: Joi.string().required(),
    serverPort: Joi.number().port().required(),
    faviconUrl: Joi.string().uri().optional(),
  }).required(),
});

const UPDATE_DOCKER_SCHEMA = Joi.object({
  dockerId: Joi.string().uuid().required(),
  dockerData: Joi.object({
    groupId: Joi.string().uuid().optional(),
    name: Joi.string().required(),
    displayName: Joi.string().min(3).max(50).optional().default(Joi.ref('name')),
    url: Joi.string().required(),
    urlPort: Joi.number().port().allow('').empty('').optional(),
    description: Joi.string().allow('').optional(),
    server: Joi.string().required(),
    serverPort: Joi.number().port().required(),
    faviconUrl: Joi.string().uri().optional(),
  }).required(),
});

const handleDockerError = (error, message) => {
  logger.error(`${message}: ${error.message}`);
  throw new Error(`${message}: ${error.message}`);
};

/**
 * 将数据库行转换为 docker 对象
 */
const rowToDocker = (row) => ({
  id: row.id,
  groupId: row.group_id,
  name: row.name,
  displayName: row.display_name,
  url: row.url,
  urlPort: row.url_port,
  description: row.description,
  server: row.server,
  serverPort: row.server_port,
  faviconUrl: (!row.favicon_url || row.favicon_url.startsWith('/icons/'))
    ? DEFAULT_DOCKER_ICON_URL
    : row.favicon_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * 获取所有存储的 Docker 记录
 */
const getAlldockers = async (env) => {
  try {
    const rows = await queryAll(env, 'SELECT * FROM dockers ORDER BY created_at ASC');
    return rows.map(rowToDocker);
  } catch (error) {
    handleDockerError(error, '获取存储的 Docker 记录失败');
    return [];
  }
};

/**
 * 获取单个 Docker 记录详情
 */
const getdockerById = async (env, dockerId) => {
  try {
    const row = await queryOne(env, 'SELECT * FROM dockers WHERE id = ?', [dockerId]);
    return row ? rowToDocker(row) : null;
  } catch (error) {
    handleDockerError(error, '获取 Docker 记录详情失败');
    return null;
  }
};

/**
 * 获取某个分组下的所有 Docker 记录
 */
const getdockersByGroupId = async (env, groupId) => {
  try {
    const rows = await queryAll(env, 'SELECT * FROM dockers WHERE group_id = ? ORDER BY created_at ASC', [groupId]);
    return rows.map(rowToDocker);
  } catch (error) {
    handleDockerError(error, '获取分组下的 Docker 记录失败');
    return [];
  }
};

/**
 * 创建 Docker 记录
 */
const createDocker = async (env, groupId, dockerData) => {
  try {
    await CREATE_DOCKER_SCHEMA.validateAsync({ groupId, dockerData });

    const existing = await queryOne(env,
      'SELECT id FROM dockers WHERE url = ? AND url_port = ?',
      [dockerData.url, dockerData.urlPort || null]
    );
    if (existing) {
      throw new Error('Docker 记录已存在');
    }

    const faviconUrl = await processFavicon(dockerData.name, dockerData.displayName);
    const now = new Date().toISOString();
    const newDocker = {
      id: uuidv4(),
      groupId,
      ...dockerData,
      faviconUrl,
      createdAt: now,
      updatedAt: now,
    };

    await execSQL(env,
      'INSERT INTO dockers (id, group_id, name, display_name, url, url_port, description, server, server_port, favicon_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newDocker.id, groupId, dockerData.name, dockerData.displayName || dockerData.name, dockerData.url || '', dockerData.urlPort || null, dockerData.description || '', dockerData.server, dockerData.serverPort, faviconUrl, now, now]
    );

    return newDocker;
  } catch (error) {
    handleDockerError(error, '创建 Docker 记录失败');
  }
};

/**
 * 更新 Docker 记录
 */
const updateDocker = async (env, dockerId, dockerData) => {
  try {
    await UPDATE_DOCKER_SCHEMA.validateAsync({ dockerId, dockerData });
    const faviconUrl = await processFavicon(dockerData.name, dockerData.displayName);
    const now = new Date().toISOString();
    const existing = await queryOne(env, 'SELECT * FROM dockers WHERE id = ?', [dockerId]);
    if (!existing) {
      throw new Error('Docker 记录不存在');
    }

    const groupId = dockerData.groupId || existing.group_id;

    await execSQL(env,
      'UPDATE dockers SET group_id = ?, name = ?, display_name = ?, url = ?, url_port = ?, description = ?, server = ?, server_port = ?, favicon_url = ?, updated_at = ? WHERE id = ?',
      [groupId, dockerData.name, dockerData.displayName || dockerData.name, dockerData.url, dockerData.urlPort || null, dockerData.description || '', dockerData.server, dockerData.serverPort, faviconUrl, now, dockerId]
    );

    return await getdockerById(env, dockerId);
  } catch (error) {
    handleDockerError(error, '更新 Docker 记录失败');
  }
};

/**
 * 删除 Docker 记录
 */
const deleteDocker = async (env, dockerId) => {
  try {
    const { changes } = await execSQL(env, 'DELETE FROM dockers WHERE id = ?', [dockerId]);
    return { deleted: changes, message: 'Docker 记录已删除' };
  } catch (error) {
    handleDockerError(error, '删除 Docker 记录失败');
  }
};

// ── 实时 Docker 操作（CF 模式下 stub）──

const CF_NOT_SUPPORTED = () => {
  throw new Error('Docker 实时功能在 Cloudflare 模式下不可用，请使用 Docker 部署模式');
};

const matchContainerByName = (containers, dockerName, options = {}) => {
  const { allowAmbiguous = false } = options;
  const expected = `/${dockerName}`;

  const exactMatches = containers.filter((c) => c.Names.includes(expected));
  if (exactMatches.length === 1) return exactMatches[0];
  if (exactMatches.length > 1) {
    if (allowAmbiguous) return null;
    throw new Error(`Docker 容器名匹配到多个候选: ${dockerName}`);
  }

  const suffixMatches = containers.filter((c) => c.Names.some((n) => n.endsWith(expected)));
  if (suffixMatches.length === 1) return suffixMatches[0];
  if (suffixMatches.length > 1) {
    if (allowAmbiguous) return null;
    throw new Error(`Docker 容器名匹配到多个候选: ${dockerName}`);
  }

  return null;
};

const findContainerByRecord = async (dockerClient, dockerRecord, options = {}) => {
  const containers = await dockerClient.listContainers({ all: true });
  return matchContainerByName(containers, dockerRecord.name, options);
};

/**
 * 获取实时容器信息（仅 Docker 模式）
 */
const getRealdockerinfo = async (env) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();

  const Docker = require('dockerode');
  const dockerRecords = await getAlldockers(env);
  if (!dockerRecords || dockerRecords.length === 0) return [];

  const servers = [...new Set(dockerRecords.map(d => `${d.server}:${d.serverPort}`))];
  const allContainerInfoList = [];

  for (const server of servers) {
    const [serverHost, serverPort] = server.split(':');
    const dockerClient = new Docker({ host: serverHost, port: parseInt(serverPort, 10), protocol: 'http' });
    try {
      const containers = await dockerClient.listContainers({ all: true });
      const serverRecords = dockerRecords.filter((r) => `${r.server}:${r.serverPort}` === server);

      for (const dockerRecord of serverRecords) {
        const containerInfo = matchContainerByName(containers, dockerRecord.name, { allowAmbiguous: true });
        if (!containerInfo) continue;

        const container = dockerClient.getContainer(containerInfo.Id);
        const stats = await container.stats({ stream: false });

        allContainerInfoList.push({
          id: containerInfo.Id,
          dockerItemId: dockerRecord.id,
          name: containerInfo.Names[0].substring(1),
          state: containerInfo.State,
          cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
          networkIO: stats.networks,
        });
      }
    } catch (serverError) {
      console.error(`Error getting containers from server ${server}:`, serverError);
    }
  }
  return allContainerInfoList;
};

const getAllServerRealdockerinfo = async (env) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  return getRealdockerinfo(env);
};

const getRecordRealdockerinfo = async (env) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  return getRealdockerinfo(env);
};

const getRealdockerinfobyId = async (env, dockerItemId) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  const Docker = require('dockerode');

  const dockerRecord = await getdockerById(env, dockerItemId);
  if (!dockerRecord) throw new Error('Docker 记录未找到');

  const dockerClient = new Docker({ host: dockerRecord.server, port: dockerRecord.serverPort, protocol: 'http' });
  const containerInfo = await findContainerByRecord(dockerClient, dockerRecord);
  if (!containerInfo) throw new Error(`Docker 容器 ${dockerRecord.name} 未找到`);

  const container = dockerClient.getContainer(containerInfo.Id);
  const stats = await container.stats({ stream: false });
  const details = await container.inspect();

  return {
    id: details.Id,
    dockerItemId: dockerRecord.id,
    name: details.Name.substring(1),
    state: details.State.Status,
    image: details.Config.Image,
    ports: details.HostConfig.PortBindings,
    cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
    memoryUsage: stats.memory_stats.usage,
    memoryLimit: stats.memory_stats.limit,
    networkIO: stats.networks,
    details,
  };
};

const startDocker = async (env, dockerItemId) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  const Docker = require('dockerode');
  const dockerRecord = await getdockerById(env, dockerItemId);
  if (!dockerRecord) throw new Error('Docker 记录未找到');
  const dockerClient = new Docker({ host: dockerRecord.server, port: dockerRecord.serverPort, protocol: 'http' });
  const containerInfo = await findContainerByRecord(dockerClient, dockerRecord);
  if (!containerInfo) throw new Error(`Docker 容器 ${dockerRecord.name} 未找到`);
  await dockerClient.getContainer(containerInfo.Id).start();
  return { message: `Docker 容器 ${dockerRecord.name} 已启动` };
};

const stopDocker = async (env, dockerItemId) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  const Docker = require('dockerode');
  const dockerRecord = await getdockerById(env, dockerItemId);
  if (!dockerRecord) throw new Error('Docker 记录未找到');
  const dockerClient = new Docker({ host: dockerRecord.server, port: dockerRecord.serverPort, protocol: 'http' });
  const containerInfo = await findContainerByRecord(dockerClient, dockerRecord);
  if (!containerInfo) throw new Error(`Docker 容器 ${dockerRecord.name} 未找到`);
  await dockerClient.getContainer(containerInfo.Id).stop();
  return { message: `Docker 容器 ${dockerRecord.name} 已停止` };
};

const restartDocker = async (env, dockerItemId) => {
  if (IS_CF_MODE || (env && env.DEPLOY_MODE === 'cloudflare')) return CF_NOT_SUPPORTED();
  const Docker = require('dockerode');
  const dockerRecord = await getdockerById(env, dockerItemId);
  if (!dockerRecord) throw new Error('Docker 记录未找到');
  const dockerClient = new Docker({ host: dockerRecord.server, port: dockerRecord.serverPort, protocol: 'http' });
  const containerInfo = await findContainerByRecord(dockerClient, dockerRecord);
  if (!containerInfo) throw new Error(`Docker 容器 ${dockerRecord.name} 未找到`);
  await dockerClient.getContainer(containerInfo.Id).restart();
  return { message: `Docker 容器 ${dockerRecord.name} 已重启` };
};

module.exports = {
  getAlldockers,
  getdockerById,
  getdockersByGroupId,
  createDocker,
  updateDocker,
  deleteDocker,
  getAllServerRealdockerinfo,
  getRealdockerinfo,
  getRecordRealdockerinfo,
  getRealdockerinfobyId,
  startDocker,
  stopDocker,
  restartDocker,
};
