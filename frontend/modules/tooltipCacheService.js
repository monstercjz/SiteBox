// tooltipCacheService.js - 负责 tooltip 的缓存管理

import { DoublyLinkedList } from './doublyLinkedList.js'; // 引入 DoublyLinkedList

const config = {
  cacheExpiration: 1000 * 60 * 10, // 缓存过期时间 (毫秒)，从 websiteTooltipService.js 中移入
  cacheCapacity: 10, // 缓存容量，LRU 缓存策略需要限制缓存容量
  cacheClearInterval: 1000 * 60 * 60 // 缓存清理间隔，1 小时清理一次过期缓存
};

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
    this.lruQueue = new DoublyLinkedList(); // 使用双向链表模拟 LRU 队列
  }

  get(key) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      this.lruQueue.moveToEnd(node); // 将节点移到队列末尾
      return node.value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this.lruQueue.moveToEnd(node);
    } else {
      if (this.cache.size >= this.capacity) {
        const removedNode = this.lruQueue.removeFirst();
        this.cache.delete(removedNode.key);
      }
      const newNode = this.lruQueue.addLast(key, value);
      this.cache.set(key, newNode);
    }
  }

  clearExpired() {
    const now = Date.now();
    for (let [key, node] of this.cache) {
      if (now - node.timestamp > config.cacheExpiration) {
        this.lruQueue.remove(node);
        this.cache.delete(key);
      }
    }
  }
}

/**
 * @class TooltipCacheService
 * @description Tooltip 缓存服务，负责管理 tooltip 数据的缓存，使用 LRUCache 实现 LRU 缓存策略
 */
export class TooltipCacheService {
  constructor() {
    this.cache = new LRUCache(config.cacheCapacity); // 使用 LRUCache 替换 Map
    // 定期清理过期缓存
    setInterval(() => {
      this.clearExpiredCache();
    }, config.cacheClearInterval);
  }

  /**
   * @method getCachedData
   * @description 从缓存中获取数据
   * @param {string} websiteId 网站 ID
   * @returns {Website | null} 缓存的网站数据，如果缓存不存在或已过期则返回 null
   */
  getCachedData(websiteId) {
    return this.cache.get(websiteId); // 使用 LRUCache 的 get 方法获取缓存数据
  }

  /**
   * @method setCacheData
   * @description 将网站数据缓存到缓存中
   * @param {string} websiteId 网站 ID
   * @param {Website} websiteData 网站数据
   */
  setCacheData(websiteId, websiteData) {
    this.cache.set(websiteId, websiteData); // 使用 LRUCache 的 set 方法设置缓存数据
  }

  /**
   * @method clearExpiredCache
   * @description 清理过期缓存
   */
  clearExpiredCache() {
    this.cache.clearExpired(); // 使用 LRUCache 的 clearExpired 方法清理过期缓存
  }
}