const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { PORT, backendUrl } = require('../config/constants');
const faviconCache = {};

async function fetchFavicon(websiteUrl) {
  const url = new URL(websiteUrl);
  const domain = url.hostname; // 使用 hostname 作为缓存键
  // if (faviconCache[domain]) {
  //   return faviconCache[domain];
  // }
  const iconFileName = `${domain}.ico`;
  const iconPath = path.resolve(__dirname, '../data/icons', iconFileName);

  // 检查本地目录中是否已存在该图片
  try {
    await fs.access(iconPath);
    faviconCache[domain] = `/data/icons/${iconFileName}`;
    console.log(`当前的`, faviconCache[domain]);
    return `${backendUrl}:${PORT}/data/icons/${iconFileName}`;
  } catch (error) {
    // 如果不存在，则进行网络请求
    console.log(`网络获取`);
    try {
      const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
      const response = await axios.get(faviconUrl, { responseType: 'arraybuffer' });

      if (response.status === 200) {
        const iconBuffer = Buffer.from(response.data, 'binary');
        await fs.writeFile(iconPath, iconBuffer);
        faviconCache[domain] = `/data/icons/${iconFileName}`;
        return `${backendUrl}:${PORT}/data/icons/${iconFileName}`;
      }
    } catch (error) {
      console.error(`Failed to fetch favicon for ${websiteUrl}:`, error.message);
    }
  }

  //return null;
  return `${backendUrl}:${PORT}/data/icons/Docker.png.ico`
}


async function deleteFaviconFile(faviconFilename) {
    const iconPath = path.resolve(__dirname, '../data/icons', faviconFilename);
    try {
        await fs.access(iconPath); // 检查文件是否存在
        await fs.unlink(iconPath); // 删除文件
        console.log(`Favicon file deleted: ${faviconFilename}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // 文件不存在，无需删除
            console.log(`Favicon file not found: ${faviconFilename}`);
        } else {
            console.error(`Error deleting favicon file ${faviconFilename}:`, error);
            throw error; // 抛出错误以便上层处理
        }
    }
}

module.exports = {
  fetchFavicon,
  deleteFaviconFile
};