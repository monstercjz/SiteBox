// backend/config/constants.js
// 常量配置

const GROUP_DATA_FILE_PATH = `${__dirname}/../data/sites-data.json`;
const DOCKER_GROUP_DATA_FILE_PATH = `${__dirname}/../data/docker-data.json`;
const PORT = process.env.PORT || 3000;
const backendUrl = process.env.BACKEND_URL || 'http://localhost';
const WEBSITE_DATA_FILE_PATH = `${__dirname}/../data/sites-data.json`;
const DOCKER_DATA_FILE_PATH = `${__dirname}/../data/docker-data.json`;
const HISTORY_DATA_FILE_PATH = `${__dirname}/../data/sites-history.json`;
const ICONS_DIR = `${__dirname}/../data/icons`;

module.exports = {
  GROUP_DATA_FILE_PATH,
  backendUrl,
  PORT,
  WEBSITE_DATA_FILE_PATH,
  HISTORY_DATA_FILE_PATH,
  FILE_DATA: {
    [GROUP_DATA_FILE_PATH]: { groups: [], websites: [], nextGroupId: 1, nextWebsiteId: 1 },
    [WEBSITE_DATA_FILE_PATH]: { groups: [], websites: [], nextGroupId: 1, nextWebsiteId: 1 },
    [HISTORY_DATA_FILE_PATH]: { websiteInfos: [] },
  },
  ICONS_DIR,
  DOCKER_GROUP_DATA_FILE_PATH,
  DOCKER_DATA_FILE_PATH,
};