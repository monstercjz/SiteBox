// backend/controllers/pluginController.js
const pluginService = require('../services/pluginService');
const apiResponse = require('../utils/apiResponse');

const getExtensionData = async (c) => {
  try {
    const env = c.env;
    const data = await pluginService.getExtensionData(env);
    return apiResponse.success(c, data);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const syncBookmarks = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const result = await pluginService.syncBookmarks(env, body.bookmarks || body);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const saveWebsiteUrl = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const result = await pluginService.saveWebsiteUrl(env, body.url, body.title, body.description, body.groupId);
    return apiResponse.success(c, result, 201);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { getExtensionData, syncBookmarks, saveWebsiteUrl };
