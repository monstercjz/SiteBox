// backend/services/searchService.js
const fileHandler = require('../utils/fileHandler');

const dataFilePath = 'backend/data/sites-data.json';

/**
 * @description 根据关键词搜索分组和网站记录
 */
const search = async (keyword) => {
  const data = await fileHandler.readData(dataFilePath);
  const groups = data.groups || [];
  const websites = data.websites || [];

  const results = [];

  if (keyword) {
    const lowerCaseKeyword = keyword.toLowerCase();
    groups.forEach(group => {
      if (group.name.toLowerCase().includes(lowerCaseKeyword)) {
        results.push({ type: 'group', ...group });
      }
    });

    websites.forEach(website => {
      if (
        website.name.toLowerCase().includes(lowerCaseKeyword) ||
        website.url.toLowerCase().includes(lowerCaseKeyword)
      ) {
        results.push({ type: 'website', ...website });
      }
    });
  }
  return results;
};

module.exports = {
  search,
};