// backend/controllers/syncController.js
const syncService = require('../services/syncService');
const apiResponse = require('../utils/apiResponse');

const exportData = async (c) => {
  try {
    const env = c.env;
    const data = await syncService.exportData(env);
    return apiResponse.success(c, data);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const importData = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    await syncService.importData(env, body);
    return apiResponse.success(c, { message: 'Data imported successfully' });
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const restoreData = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const result = await syncService.restoreData(env, body.backupId || body.versionId);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const moveToTrash = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const result = await syncService.moveToTrash(env, body.websiteIds);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const listBackups = async (c) => {
  try {
    const env = c.env;
    const backups = await syncService.listBackups(env);
    return apiResponse.success(c, backups);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getHistory = async (c) => {
  try {
    const env = c.env;
    const history = await syncService.getHistory(env);
    return apiResponse.success(c, history);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const cloudSync = async (c) => {
  try {
    const env = c.env;
    const result = await syncService.cloudSync(env);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { exportData, importData, restoreData, moveToTrash, listBackups, getHistory, cloudSync };
