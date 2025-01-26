'use strict';

/**
 * 表示一个分组。
 */
class Group {
    /**
     * 创建一个 Group 实例。
     * @param {string} id - 分组 ID。
     * @param {string} name - 分组名称。
     * @param {number} order - 分组顺序。
     * @param {boolean} isCollapsible - 是否可折叠。
     */
    constructor(id, name, order, isCollapsible) {
        if (typeof id !== 'string') {
            throw new Error('id 必须是字符串');
        }
        if (typeof name !== 'string') {
            throw new Error('name 必须是字符串');
        }
        if (typeof order !== 'number') {
            throw new Error('order 必须是数字');
        }
            // 提供默认值
        //isCollapsible = isCollapsible ?? false;
        if (typeof isCollapsible !== 'boolean') {
            throw new Error('isCollapsible 必须是布尔值');
        }
        this.id = id;
        this.name = name;
        this.order = order;
        this.isCollapsible = isCollapsible ?? false;
        //this.isCollapsible = isCollapsible;
    }

}

module.exports = Group;