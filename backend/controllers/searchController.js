// backend/controllers/searchController.js
const searchService = require('../services/searchService');
const apiResponse = require('../utils/apiResponse');

/**
 * @description 根据关键词搜索分组和网站记录
 */
const search = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const results = await searchService.search(keyword);
    apiResponse.success(res, results);
  } catch (error) {
    apiResponse.error(res, error.message);
  }
};

module.exports = {
  search,
};