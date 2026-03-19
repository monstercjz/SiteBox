// backend/controllers/miscController.js
const miscService = require('../services/miscService');
const apiResponse = require('../utils/apiResponse');

const getStatus = async (c) => {
  try {
    const result = await miscService.getStatus();
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getHelp = async (c) => {
  try {
    const result = await miscService.getHelp();
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getSiteName = async (c) => {
  try {
    const env = c.env;
    const result = await miscService.getSiteName(env);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const updateSiteName = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const siteName = body.siteName ?? body.newSiteName;
    const result = await miscService.updateSiteName(env, siteName);
    return apiResponse.success(c, result);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { getStatus, getHelp, getSiteName, updateSiteName };
