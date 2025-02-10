// backend/services/dockerService.js
const Docker = require('dockerode');

// 初始化 Docker 客户端 (连接到远程 Docker 主机)
const docker = new Docker({
  host: '192.168.3.245', // 远程 Docker 主机的 IP 地址
  port: 2375, // Docker API 默认端口
  protocol: 'http', // 使用 HTTP 协议
});

/**
 * @description 获取 Docker 容器列表及详细信息
 */
const getContainers = async () => {
  try {
    const containers = await docker.listContainers({ all: true }); // 获取所有容器，包括运行和停止的
    const containerInfoList = await Promise.all(containers.map(async (containerInfo) => {
      const container = docker.getContainer(containerInfo.Id);
      const stats = await container.stats({ stream: false }); // 获取容器的实时统计信息
      const details = await container.inspect(); // 获取容器的详细信息

      return {
        id: containerInfo.Id,
        name: containerInfo.Names[0].substring(1), // 去掉容器名称前面的 "/"
        state: containerInfo.State,
        image: containerInfo.Image,
        ports: containerInfo.Ports,
        cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
        memoryUsage: stats.memory_stats.usage,
        memoryLimit: stats.memory_stats.limit,
        networkIO: stats.networks, // 网络 IO 信息
        details: details, // 包含更详细的容器配置信息，如果需要可以前端展示
      };
    }));
    return containerInfoList;
  } catch (error) {
    console.error('Error getting Docker containers:', error);
    throw error;
  }
};

module.exports = {
  getContainers,
};