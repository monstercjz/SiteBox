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

    const domainname = domain.match(/^[^.]+\.[^.]+/)[0]; // 使用正则表达式提取第一个部分

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
    console.log(`domainname: ${domainname}`);
    if (faviconUrls && faviconUrls !== '/data/icons/Docker.png.ico') {
      console.log(`Favicon found in dockericons: ${faviconUrls}`);
      return faviconUrls;
    }
    
    // 网络请求获取 favicon
    const websitefaviconUrl = `${url.protocol}//${url.hostname}/favicon.ico`;
    const googlefaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
    const duckduckgoUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    const bingFaviconUrl = `https://api.faviconkit.com/${domain}/144`;

    // 定义所有可能的 favicon URL 源
    const faviconSources = [
      { url: websitefaviconUrl, name: 'Website' },
      { url: googlefaviconUrl, name: 'Google' },
      { url: duckduckgoUrl, name: 'DuckDuckGo' },
      { url: bingFaviconUrl, name: 'Bing' }
    ];

    // 尝试从每个源获取 favicon
    for (const { url: faviconUrl, name } of faviconSources) {
      try {
        console.log(`Trying to fetch favicon from ${name}: ${faviconUrl}`);
        return await getFaviconFileFromNet(faviconUrl, domain);
      } catch (error) {
        console.error(`Failed to fetch favicon from ${name} for ${websiteUrl}:`, error.message);
      }
    }
    // 如果所有方法都失败，返回默认图标
    console.log('All attempts failed. Returning default favicon.');
    return `/data/icons/Docker.png.ico`;
  } catch (error) {
    console.error(`Failed to fetch favicon for ${websiteUrl}:`, error.message);
    // 返回默认图标
    return `/data/icons/Docker.png.ico`
  }
}
//return null;

async function getFaviconFileFromNet(faviconUrl, domain) {
  // 网络请求获取 favicon
  // const faviconUrl = `${url.protocol}//${domain}/favicon.ico`;
  console.log(`Fetching favicon from ${faviconUrl}`);
  const response = await axios.get(faviconUrl, {
    responseType: 'arraybuffer',
    timeout: 5000, // 设置超时时间
    // proxy: {
    //   host: '127.0.0.1', // 代理服务器地址
    //   port: 10809,             // 代理服务器端口
      // auth: {
      //   username: 'proxy-username', // 可选：代理用户名
      //   password: 'proxy-password' // 可选：代理密码
      // }
    // }
  });
  // 检查 MIME 类型
  const contentType = response.headers['content-type'];
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error(`Invalid content type: ${contentType}`);
  }
  // 动态生成文件扩展名
  let iconExt = {
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/jpeg': 'jpg'
  }[contentType];
  if (!iconExt) {
    console.warn(`Unsupported MIME type: ${contentType}. Using default extension '.ico'.`);
    iconExt = 'ico'; // 使用默认扩展名
  }
  const dir = path.resolve(__dirname, '..', 'data', 'icons');
  await fs.mkdir(dir, { recursive: true }); // 确保目录存在
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