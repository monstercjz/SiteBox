// backend/controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');
const apiResponse = require('../utils/apiResponse');

const recordClick = async (c) => {
  try {
    const env = c.env;
    const body = await c.req.json();
    const updated = await analyticsService.updateLastClickTime(env, body.websiteId);
    return apiResponse.success(c, { updated });
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

const getAnalytics = async (c) => {
  try {
    const env = c.env;
    const limit = Number(c.req.query('limit')) || 20;
    const data = await analyticsService.getAnalytics(env, limit);
    return apiResponse.success(c, data);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { recordClick, getAnalytics };
