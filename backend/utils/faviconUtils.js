// backend/utils/faviconUtils.js
// 不再下载/持久化 favicon，直接返回外部 URL 字符串

/**
 * 获取网站 favicon 的外部 URL
 * 优先 DuckDuckGo，备选 Google Favicons
 * @param {string} websiteUrl
 * @param {string} [customFaviconUrl]
 * @returns {Promise<string>}
 */

const isLocalNetwork = (hostname) => {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)
  );
};

// 增加一个 URL 补全辅助函数
const ensureHttp = (url) => {
  if (!url) return '';
  return url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
};

const fetchFavicon = async (websiteUrl, customFaviconUrl) => {
  if (customFaviconUrl) {
    return customFaviconUrl;
  }

  try {
    // 自动补全 http://，防止 new URL() 解析崩溃
    const safeUrl = new URL(ensureHttp(websiteUrl));
    const domain = safeUrl.hostname;

    if (isLocalNetwork(domain)) {
      // 局域网服务：直连尝试拉取
      return `${safeUrl.origin}/favicon.ico`;
    }

    // 公网服务：优先 DuckDuckGo
    // return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    return `https://www.google.com/s2/favicons?sz=128&domain_url=${domain}`;

  } catch (error) {
    console.error('[Favicon] URL parsing error:', error);
    // 万一解析还是失败，直接把原始字符串扔给前端，让前端降级处理
    return '';
  }
};

const deleteFaviconFile = async (faviconFilename) => {};

module.exports = {
  fetchFavicon,
  deleteFaviconFile,
};