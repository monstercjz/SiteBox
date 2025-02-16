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
     * @param {string} groupType - 分组类型 (website-group 或 docker-group)。
     * @param {string} dashboardType - 仪表盘类型 (website 或 docker)。
     */
    constructor(id, name, order, isCollapsible, groupType, dashboardType) {
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
        if (typeof groupType !== 'string') {
            throw new Error('groupType 必须是字符串');
        }
        if (typeof dashboardType !== 'string') {
            throw new Error('dashboardType 必须是字符串');
        }
        this.id = id;
        this.name = name;
        this.order = order;
        this.isCollapsible = isCollapsible ?? false;
        this.groupType = groupType; // 分组类型：website-group 或 docker-group
        this.dashboardType = dashboardType; // 仪表盘类型: website 或 docker
    }

}

module.exports = Group;