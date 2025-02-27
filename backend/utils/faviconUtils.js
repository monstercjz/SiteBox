const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { PORT, backendUrl } = require('../config/constants');
const faviconCache = {};
const { processFavicon } = require('./dockerfavicon.js');
async function fetchFavicon(websiteUrl) {
  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname; // 使用 hostname 作为缓存键
    
    const domainname = domain.match(/^[^.]+/)[0]; // 使用正则表达式提取第一个部分
    
    // 检查缓存
    if (faviconCache[domain]) {
      console.log(`Favicon found in cache: ${faviconCache[domain]}`);
      return faviconCache[domain];
    }

    // 检查本地目录中是否已存在该图片
    const possibleExtensions = ['.ico', '.png', '.svg'];
    let existingFilePath = null;

    for (const ext of possibleExtensions) {
      const iconPath = path.resolve(__dirname, '..', 'data', 'icons', `${domain}${ext}`);
      try {
        await fs.access(iconPath);
        existingFilePath = `/data/icons/${domain}${ext}`;
        break; // 找到文件后立即退出循环
      } catch (error) {
        // 文件不存在，继续检查下一个扩展名
      }
    }

    if (existingFilePath) {
      faviconCache[domain] = existingFilePath;
      console.log(`Favicon found in local directory: ${existingFilePath}`);
      return existingFilePath;
    }
    const faviconUrls = await processFavicon(domainname);
    if (faviconUrls && faviconUrls !== '/data/icons/Docker.png.ico') {
      console.log(`Favicon found in dockericons: ${faviconUrls}`);
      return faviconUrls;
    }

    // 网络请求获取 favicon
    const faviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
    const response = await axios.get(faviconUrl, {
      responseType: 'arraybuffer',
      timeout: 5000 // 设置超时时间
    });

    // 检查 MIME 类型
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // 动态生成文件扩展名
    let iconExt = {
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico', // 新增支持
      'image/png': 'png',
      'image/svg+xml': 'svg'
    }[contentType];

    if (!iconExt) {
      console.warn(`Unsupported MIME type: ${contentType}. Using default extension '.ico'.`);
      iconExt = 'ico'; // 使用默认扩展名
    }

    const iconFileName = `${domain}.${iconExt}`;
    const iconPathWithExt = path.resolve(__dirname, '..', 'data', 'icons', iconFileName);

    // 验证响应数据是否为空
    if (response.data.length === 0) {
      throw new Error('Empty response data');
    }

    // 保存文件
    await fs.writeFile(iconPathWithExt, response.data);
    faviconCache[domain] = `/data/icons/${iconFileName}`;
    return faviconCache[domain];
  } catch (error) {
    console.error(`Failed to fetch favicon for ${websiteUrl}:`, error.message);

    // 返回默认图标
    return `/data/icons/Docker.png.ico`
  }
}
  //return null;
  


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