// backend/services/dockerService.js
const Docker = require('dockerode');
const fileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../utils/logger');
const { fetchFavicon } = require('../utils/faviconUtils');

const { DOCKER_DATA_FILE_PATH } = require('../config/constants');

// 初始化 Docker 客户端 (连接到远程 Docker 主机)
const docker = new Docker({
  host: '192.168.3.245', // 远程 Docker 主机的 IP 地址
  port: 2375, // Docker API 默认端口
  protocol: 'http', // 使用 HTTP 协议
});

/**
 * Docker 数据结构定义
 * @typedef {Object} DockerItem
 * @property {string} id - 唯一标识
 * @property {string} groupId - 所属分组ID
 * @property {string} name - 显示名称
 * @property {string} url - 访问地址
 * @property {number} urlPort - 访问端口
 * @property {string} description - 描述信息
 * @property {string} faviconUrl - 图标地址
 * @property {string} server - Docker 服务器地址
 * @property {number} serverPort - Docker 服务器端口
 */

// Joi 校验规则
const CREATE_DOCKER_SCHEMA = Joi.object({
  groupId: Joi.string().uuid().required(),
  dockerData: Joi.object({
    name: Joi.string().required(),
    url: Joi.string(),
    urlPort: Joi.number().port().required(),
    description: Joi.string().allow(''),
    server: Joi.string().required(),
    serverPort: Joi.number().port().required(),
    faviconUrl: Joi.string().uri()
  }).required()
});

const UPDATE_DOCKER_SCHEMA = Joi.object({
  dockerId: Joi.string().uuid().required(),
  dockerData: Joi.object({
    groupId: Joi.string().uuid(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    urlPort: Joi.number().port().required(),
    description: Joi.string().allow(''),
    server: Joi.string().required(),
    serverPort: Joi.number().port().required(),
    faviconUrl: Joi.string().uri()
  }).required()
});

// 错误处理
const handleDockerError = (error, message) => {
  logger.error(`${message}: ${error.message}`);
  throw new Error(`${message}: ${error.message}`);
};

/**
 * @description 获取所有 Docker 容器实时信息 (修改后，从数据文件读取服务器信息并批量获取)当前这个模式会有大量的数据，会记录全部docker容器，即便容器没有在本地后端数据存储
 */
const getRealdockerinfo = async () => {
  try {
    const dockerRecords = await getAlldockers(); // 从数据文件读取 Docker 记录 
    if (!dockerRecords || dockerRecords.length === 0) {
      return []; // 如果没有 Docker 记录，则返回空数组
    }

    // 提取去重的服务器列表
    const servers = [...new Set(dockerRecords.map(d => `${d.server}:${d.serverPort}`))];
    const dockerClients = {}; // 用于缓存 Docker 客户端
    const allContainerInfoList = [];

    for (const server of servers) {
      const [serverHost, serverPort] = server.split(':');
      const clientKey = `${serverHost}:${serverPort}`;

      // 动态创建 Docker 客户端
      if (!dockerClients[clientKey]) {
        dockerClients[clientKey] = new Docker({
          host: serverHost,
          port: parseInt(serverPort, 10),
          protocol: 'http',
        });
      }
      const dockerClient = dockerClients[clientKey];

      try {
        const containers = await dockerClient.listContainers({ all: true });
        const containerInfoList = await Promise.all(containers.map(async (containerInfo) => {
          const container = dockerClient.getContainer(containerInfo.Id);
          const stats = await container.stats({ stream: false });
          const details = await container.inspect();

          const dockerRecord = dockerRecords.find(record => `${record.server}:${record.serverPort}` === server && record.name === containerInfo.Names[0].substring(1)); // 查找匹配的 Docker 记录

          return {
            id: containerInfo.Id,
            dockerItemId: dockerRecord ? dockerRecord.id : null, // 添加 dockerItemId
            name: containerInfo.Names[0].substring(1),
            state: containerInfo.State,
            image: containerInfo.Image,
            ports: containerInfo.Ports,
            cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
            memoryUsage: stats.memory_stats.usage,
            memoryLimit: stats.memory_stats.limit,
            networkIO: stats.networks,
            details: details,
          };
        }));
        allContainerInfoList.push(...containerInfoList);
      } catch (serverError) {
        console.error(`Error getting containers from server ${server}:`, serverError);
        // 忽略单个服务器的错误，继续获取其他服务器的信息
      }
    }

    return allContainerInfoList; // 返回整合后的所有容器信息
  } catch (error) {
    console.error('Error getting Docker containers:', error);
    throw error;
  }
};


/**
 * @description 获取单个 Docker 容器实时状态
 */
const getRealdockerinfobyId = async (containerId) => {
  console.log('getRealdockerinfobyId', containerId);
  try {
    const container = docker.getContainer(containerId);
    const stats = await container.stats({ stream: false }); // 获取容器的实时统计信息
    const details = await container.inspect(); // 获取容器的详细信息
    const containerInfo = await container.inspect();

    return {
      id: containerInfo.Id,
      name: containerInfo.Name.substring(1), // 去掉容器名称前面的 "/"
      state: containerInfo.State.Status,
      image: containerInfo.Config.Image,
      ports: containerInfo.HostConfig.PortBindings,
      cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
      memoryUsage: stats.memory_stats.usage,
      memoryLimit: stats.memory_stats.limit,
      networkIO: stats.networks, // 网络 IO 信息
      details: details, // 包含更详细的容器配置信息，如果需要可以前端展示
    };
  } catch (error) {
    console.error('Error getting Docker container info:', error);
    throw error;
  }
};


/**
 * 获取所有存储的 Docker 记录 
 */
const getAlldockers = async () => {
  try {
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    return data.dockers || []; // 返回存储的 Docker 记录，如果没有则返回空数组
  } catch (error) {
    handleDockerError(error, '获取存储的 Docker 记录失败');
    return []; // 发生错误时返回空数组，避免程序崩溃
  }
};

/**
 * 获取单个存储的 Docker 记录详情
 */
const getdockerById = async (dockerId) => {
  try {
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    const docker = (data.dockers || []).find(d => d.id === dockerId);
    return docker || null; // 返回找到的 Docker 记录，如果没有则返回 null
  } catch (error) {
    handleDockerError(error, '获取存储的 Docker 记录详情失败');
    return null; // 发生错误时返回 null
  }
};


/**
 * 获取某个分组下的所有 Docker 记录 
 */
const getdockersByGroupId = async (groupId) => {
  try {
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    const dockers = (data.dockers || []).filter(docker => docker.groupId === groupId);
    return dockers || []; // 返回找到的 Docker 记录，如果没有则返回空数组
  } catch (error) {
    handleDockerError(error, '获取分组下的 Docker 记录失败');
    return []; // 发生错误时返回空数组，避免程序崩溃
  }
};


/**
 * 创建 Docker 记录 
 */
const createDocker = async (groupId, dockerData) => {
  console.log('dockerData', dockerData);
  try {
    
    // console.log('dockerData before validation:', dockerData);
    await CREATE_DOCKER_SCHEMA.validateAsync({ groupId, dockerData });
    // console.log('dockerData after validation:', dockerData);
    
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    const existing = (data.dockers || []).find(d => 
      d.url === dockerData.url && 
      d.urlPort === dockerData.urlPort
    );
    
    if (existing) {
      throw new Error('Docker 记录已存在');
    }

    const faviconUrl = await fetchFavicon(dockerData.url) || 
      `https://via.placeholder.com/64?text=${dockerData.name[0]}`;

    const newDocker = {
      id: uuidv4(),
      groupId,
      ...dockerData,//这个写法就导致必须在controller里先解析出来，并且前端调用的时候必须加大括号包裹
      faviconUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    data.dockers = [...(data.dockers || []), newDocker];
    await fileHandler.writeData(DOCKER_DATA_FILE_PATH, data);
    
    return newDocker;
  } catch (error) {
   console.error('Joi validation error:', error); // 打印 Joi 验证错误信息
   handleDockerError(error, '创建 Docker 记录失败');
  }

};

/**
 * 更新 Docker 记录 
 */
const updateDocker = async (dockerId, dockerData) => {
  try {
    await UPDATE_DOCKER_SCHEMA.validateAsync({ dockerId, dockerData });
    
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    const updated = data.dockers.map(d => {
      if (d.id === dockerId) {
        return {
          ...d,
          ...dockerData,
          updatedAt: new Date()
        };
      }
      return d;
    });

    data.dockers = updated;
    await fileHandler.writeData(DOCKER_DATA_FILE_PATH, data);
    
    return updated.find(d => d.id === dockerId);
  } catch (error) {
    handleDockerError(error, '更新 Docker 记录失败');
  }
};

/**
 * 删除 Docker 记录 
 */
const deleteDocker = async (dockerId) => {
  try {
    const data = await fileHandler.readData(DOCKER_DATA_FILE_PATH);
    const initialCount = data.dockers?.length || 0;
    
    data.dockers = (data.dockers || []).filter(d => d.id !== dockerId);
    await fileHandler.writeData(DOCKER_DATA_FILE_PATH, data);
    
    return { 
      deleted: initialCount - (data.dockers?.length || 0),
      message: 'Docker 记录已删除'
    };
  } catch (error) {
    handleDockerError(error, '删除 Docker 记录失败');
  }
};


module.exports = {
  getRealdockerinfo,
  createDocker,
  getRealdockerinfobyId,
  updateDocker,
  getAlldockers,
  deleteDocker,
  getdockerById,
  getdockersByGroupId,
};
