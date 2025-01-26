/**
 * 网站搜索服务模块
 * 提供简单的客户端搜索功能
 * 根据网站名称或URL进行实时过滤
 */
export class SearchService {
  constructor() {
    this.searchContainer = document.querySelector('.search-container');
    this.searchIcon = document.querySelector('.search-icon');
    this.searchInput = document.querySelector('.search-input');
    this.hideTimeout = null;
    this.init();
  }

  /**
   * 初始化搜索功能
   * 添加事件监听器
   */
  init() {
    // 点击图标展开/隐藏搜索框
    this.searchIcon.addEventListener('click', () => {
      if (this.searchContainer.classList.contains('expanded')) {
        this.toggleSearch(false);
      } else {
        this.toggleSearch(true);
      }
    });

    // 输入时过滤网站并重置计时器
    this.searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.trim().toLowerCase();
      this.filterSites(searchTerm);
      this.resetInactivityTimer();
    });

    // 监听键盘事件以重置计时器
    this.searchInput.addEventListener('keydown', () => {
      this.resetInactivityTimer();
    });

    // 点击搜索框时重置计时器
    this.searchInput.addEventListener('click', () => {
      this.resetInactivityTimer();
    });

    // 鼠标进入搜索区域时重置计时器
    this.searchContainer.addEventListener('mouseenter', () => {
      if (this.searchContainer.classList.contains('expanded')) {
        this.resetInactivityTimer();
      }
    });
  }

  /**
   * 切换搜索框状态
   * @param {boolean} show - 是否显示搜索框
   */
  toggleSearch(show) {
    this.searchContainer.classList.toggle('expanded', show);
    if (show) {
      this.searchInput.focus();
    }
  }

  /**
   * 根据搜索词过滤网站
   * @param {string} searchTerm - 搜索关键词
   */
  filterSites(searchTerm) {
    const siteElements = document.querySelectorAll('.website-item');
    siteElements.forEach(element => {
      const siteLink = element.querySelector('a');
      const siteName = siteLink.textContent.toLowerCase();
      const siteUrl = siteLink.href.toLowerCase();
      
      // 根据名称或URL匹配
      if (siteName.includes(searchTerm) || siteUrl.includes(searchTerm)) {
        element.style.display = '';
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * 重置无操作计时器
   * 5秒无操作后自动隐藏搜索框
   */
  resetInactivityTimer() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = setTimeout(() => {
      this.toggleSearch(false);
    }, 5000);
  }
}
