// backend/controllers/searchController.js
const searchService = require('../services/searchService');
const apiResponse = require('../utils/apiResponse');

const search = async (c) => {
  try {
    const env = c.env;
    const keyword = c.req.query('keyword') || '';
    const results = await searchService.search(env, keyword);
    return apiResponse.success(c, results);
  } catch (err) {
    return apiResponse.error(c, err.message);
  }
};

module.exports = { search };
