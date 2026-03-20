// externalSearchService.js
// 外部搜索引擎服务，支持谷歌、Bing、百度切换

// 随机格言数组（前面添加空格模拟居中效果）
const PLACEHOLDER_QUOTES = [
  '　　　　　　　　　　　　　　今天也要加油鸭！',
  '　　　　　　　　　　　　　　每一天都是新的开始',
  '　　　　　　　　　　　　　　保持热爱，奔赴山海',
  '　　　　　　　　　　　　　　生活不止眼前的苟且',
  '　　　　　　　　　　　　　　愿你今天有个好心情',
  '　　　　　　　　　　　　　　今天天气怎么样？',
  '　　　　　　　　　　　　　　记得多喝水哦~',
  '　　　　　　　　　　　　　　适当休息一下也不错',
  '　　　　　　　　　　　　　　今天也要努力工作！',
  '　　　　　　　　　　　　　　梦想还是要有的',
  '　　　　　　　　　　　　　　今天也要开心鸭！',
  '　　　　　　　　　　　　　　生活明朗，万物可爱',
  '　　　　　　　　　　　　　　不负春光，野蛮生长',
  '　　　　　　　　　　　　　　今天也是美好的一天',
  '　　　　　　　　　　　　　　加油！你是最棒的！',
  '　　　　　　　　　　　　　　愿所有的美好都如约而至',
  '　　　　　　　　　　　　　　今天也要元气满满！',
  '　　　　　　　　　　　　　　保持微笑，好运常在',
  '　　　　　　　　　　　　　　今天也要闪闪发光！',
  '　　　　　　　　　　　　　　万物可爱，人间值得'
];

const SEARCH_ENGINES = {
  google: {
    name: '谷歌',
    url: 'https://www.google.com/search?q='
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q='
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd='
  }
};

const STORAGE_KEY = 'selectedSearchEngine';

/**
 * 获取选中的搜索引擎
 */
export function getSelectedSearchEngine() {
  return localStorage.getItem(STORAGE_KEY) || 'google';
}

/**
 * 设置选中的搜索引擎
 */
export function setSelectedSearchEngine(engine) {
  if (SEARCH_ENGINES[engine]) {
    localStorage.setItem(STORAGE_KEY, engine);
  }
}

/**
 * 获取随机格言作为placeholder
 */
function getRandomPlaceholder() {
  const index = Math.floor(Math.random() * PLACEHOLDER_QUOTES.length);
  return PLACEHOLDER_QUOTES[index];
}

/**
 * 执行搜索
 * @param {string} keyword - 搜索关键词
 * @param {string} engine - 搜索引擎（可选，默认使用选中的搜索引擎）
 */
export function performSearch(keyword, engine) {
  if (!keyword || !keyword.trim()) {
    return;
  }

  const selectedEngine = engine || getSelectedSearchEngine();
  const searchUrl = SEARCH_ENGINES[selectedEngine].url + encodeURIComponent(keyword.trim());

  // 在新标签页中打开搜索结果
  window.open(searchUrl, '_blank');
}

/**
 * 初始化外部搜索服务
 */
export function initExternalSearchService() {
  const searchInput = document.getElementById('external-search-input');
  const searchButton = document.getElementById('external-search-button');
  const engineSelect = document.getElementById('search-engine-select');

  if (!searchInput || !searchButton || !engineSelect) {
    console.warn('External search elements not found');
    return;
  }

  // 设置随机格言作为placeholder
  searchInput.placeholder = getRandomPlaceholder();

  // 恢复上次选中的搜索引擎
  const savedEngine = getSelectedSearchEngine();
  engineSelect.value = savedEngine;

  // 搜索引擎切换事件
  engineSelect.addEventListener('change', (e) => {
    setSelectedSearchEngine(e.target.value);
  });

  // 搜索按钮点击事件
  searchButton.addEventListener('click', () => {
    const keyword = searchInput.value;
    performSearch(keyword);
  });

  // 输入框回车事件
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const keyword = searchInput.value;
      performSearch(keyword);
    }
  });
}