// backend/utils/faviconUtils.js
// 不再下载/持久化 favicon，直接返回外部 URL 字符串

/**
 * 获取网站 favicon 的外部 URL
 * 优先 DuckDuckGo，备选 Google Favicons
 * @param {string} websiteUrl
 * @param {string} [customFaviconUrl]
 * @returns {Promise<string>}
 */
const fetchFavicon = async (websiteUrl, customFaviconUrl) => {
  if (customFaviconUrl) {
    return customFaviconUrl;
  }
  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname;
    // 优先使用 DuckDuckGo favicon 服务
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  } catch (error) {
    // URL 解析失败时返回 Google Favicons 备选
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${websiteUrl}`;
  }
};

/**
 * 删除 favicon（原本删除本地文件，现在为 no-op）
 */
const deleteFaviconFile = async (faviconFilename) => {
  // favicon 为外部 URL，无需删除任何文件
};

module.exports = {
  fetchFavicon,
  deleteFaviconFile,
};
