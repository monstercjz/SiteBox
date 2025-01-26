// backend/config/constants.js
// 常量配置

const GROUP_DATA_FILE_PATH = `${__dirname}/../data/sites-data.json`;

const PORT = 3000;
const WEBSITE_DATA_FILE_PATH = `${__dirname}/../data/sites-data.json`;
const HISTORY_DATA_FILE_PATH = `${__dirname}/../data/sites-history.json`;
const ICONS_DIR = `${__dirname}/../data/icons`;

module.exports = {
  GROUP_DATA_FILE_PATH,
  PORT,
  WEBSITE_DATA_FILE_PATH,
  HISTORY_DATA_FILE_PATH,
  FILE_DATA: {
    [GROUP_DATA_FILE_PATH]: { groups: [], websites: [], nextGroupId: 1, nextWebsiteId: 1 },
    [WEBSITE_DATA_FILE_PATH]: { groups: [], websites: [], nextGroupId: 1, nextWebsiteId: 1 },
    [HISTORY_DATA_FILE_PATH]: { websiteInfos: [] },
  },
  ICONS_DIR,
};