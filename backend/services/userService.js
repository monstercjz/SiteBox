// backend/services/userService.js
const fileHandler = require('../utils/fileHandler');

const dataFilePath = 'backend/data/configData.json';

/**
 * @description 获取用户设置
 */
const getSettings = async () => {
  try {
    const data = await fileHandler.readData(dataFilePath);
    return data.settings || {};
  } catch (error) {
      return {};
  }
};

/**
 * @description 更新用户设置
 */
const updateSettings = async (settingsData) => {
  const data = await fileHandler.readData(dataFilePath);
  data.settings = { ...data.settings, ...settingsData };
  await fileHandler.writeData(dataFilePath, data);
  return data.settings;
};

module.exports = {
  getSettings,
  updateSettings,
};