// backend/config/constants.js
// 只保留业务常量，文件路径全部移除（存储改为 D1/SQLite）

// 分组类型常量
const WEBSITE_GROUP_TYPE = 'website-group';
const DOCKER_GROUP_TYPE = 'docker-group';

// 仪表盘类型常量
const WEBSITE_DASHBOARD_TYPE = 'website';
const DOCKER_DASHBOARD_TYPE = 'docker';

module.exports = {
  WEBSITE_GROUP_TYPE,
  DOCKER_GROUP_TYPE,
  WEBSITE_DASHBOARD_TYPE,
  DOCKER_DASHBOARD_TYPE,
};
