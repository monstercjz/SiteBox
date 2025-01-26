// backend/controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 记录网站点击时间
 */
const recordClick = async (req, res) => {
  try {
    const { websiteId } = req.body;
    
    if (!websiteId) {
      return apiResponse.error(res, 'websiteId is required', 400);
    }

    await analyticsService.updateLastClickTime(websiteId);
    apiResponse.success(res, { success: true });
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

module.exports = {
  recordClick
};
