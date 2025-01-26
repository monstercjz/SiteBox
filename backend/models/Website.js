// backend/models/Website.js
class Website {
    constructor(id, groupId, name, url, description, faviconUrl, lastAccessTime, order, isAccessible) {
        if (typeof id !== 'string') {
            throw new Error('id 必须是字符串');
        }
        if (typeof groupId !== 'string') {
            throw new Error('groupId 必须是字符串');
        }
        if (typeof name !== 'string') {
            throw new Error('name 必须是字符串');
        }
        if (typeof url !== 'string') {
            throw new Error('url 必须是字符串');
        }
        if (typeof order !== 'number') {
            throw new Error('order 必须是数字');
        }
        if (typeof isAccessible !== 'boolean') {
            throw new Error('isAccessible 必须是布尔值');
        }
        this.id = id;
        this.groupId = groupId;
        this.name = name;
        this.url = url;
        this.description = description;
        this.faviconUrl = faviconUrl;
        this.lastAccessTime = lastAccessTime;
        this.order = order;
        this.isAccessible = isAccessible;
    }

    updateLastAccessTime() {
        this.lastAccessTime = new Date();
    }

    markAsInaccessible() {
        this.isAccessible = false;
    }
}

module.exports = Website;