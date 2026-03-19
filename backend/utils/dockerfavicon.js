// backend/utils/dockerfavicon.js

const DEFAULT_DOCKER_ICON_URL = 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/docker.svg';

/**
 * 处理 Docker 图标逻辑
 * 返回可直接访问的公网图标地址，避免前后端分离场景下本地静态路径失效
 * @returns {Promise<string>} 图标 URL
 */
const processFavicon = async () => {
  return DEFAULT_DOCKER_ICON_URL;
};

module.exports = {
  processFavicon,
  DEFAULT_DOCKER_ICON_URL,
};
