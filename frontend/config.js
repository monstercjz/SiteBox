export const backendUrl = 'http://localhost:3000/api';
// config.js
//以下内容是groupoperationservice.js中引用的常量
// 模态框相关常量
export const MODAL_ID = 'groupModal';
export const MODAL_TITLE_EDIT = '编辑分组';
export const MODAL_TITLE_ADD = '添加分组';
export const INPUT_ID_NEW_GROUP_NAME = 'newGroupName';
export const SELECT_ID_GROUP_TYPE = 'groupTypeSelect';
export const BUTTON_CLASS_SAVE = 'save-modal-button';
export const BUTTON_CLASS_CANCEL = 'cancel-modal-button';
// 以下内容是edittitle.js中引用的常量
export const MODAL_TITLE_EDIT_SITE_NAME = '编辑网站名称';
export const INPUT_ID_NEW_SITE_NAME = 'newSiteName';

// 分组类型相关常量
// export const GROUP_TYPE_WEBSITE = 'website-group';
// export const GROUP_TYPE_DOCKER = 'docker-group';
export const GROUP_LABEL_WEBSITE = 'website 分组';
export const GROUP_LABEL_DOCKER = 'Docker 分组';

// 仪表盘类型相关常量
// export const DASHBOARD_TYPE_WEBSITE = 'website';
// export const DASHBOARD_TYPE_DOCKER = 'docker';

// ARIA 相关常量
export const ARIA_LABEL_CLOSE_MODAL = '关闭模态框';
export const ARIA_LABEL_SAVE = '保存';
export const ARIA_LABEL_CANCEL = '取消';
//以下内容是maindashboardservice.js中引用的常量
// config.js

// 仪表盘相关常量
export const WEBSITE_DASHBOARD_ID = 'websitedashboard';
export const DOCKER_DASHBOARD_ID = 'dockerdashboard';
export const MAIN_CONTAINER_SELECTOR = 'main';

// 分组类型相关常量
export const DASHBOARD_TYPE_WEBSITE = 'website';
export const DASHBOARD_TYPE_DOCKER = 'docker';
export const GROUP_TYPE_WEBSITE = 'website-group';
export const GROUP_TYPE_DOCKER = 'docker-group';

// 类名相关常量
export const CLASS_WEBSITE_GROUP = 'website-group';
export const CLASS_DOCKER_GROUP = 'docker-group';
export const CLASS_WEBSITE_ITEM = 'website-item';
export const CLASS_DOCKER_ITEM = 'docker-item';
export const GROUP_NAME = 'group-name';
export const ICON_BUTTON = 'icon-button';

// 数据属性相关常量
export const DATA_DESCRIPTION = 'data-description';
export const DATA_DOCKER_NAME = 'data-docker-name';
// export const DATA_WEBSITE_ID = 'data-website-id';
// export const DATA_DOCKER_ID = 'data-docker-id';
export const DATA_GROUP_ID = 'data-group-id';
export const DATA_DOCKER_SERVER_IP = 'data-docker-server-ip';
export const DATA_DOCKER_SERVER_PORT = 'data-docker-server-port';
export const DATA_DOCKER_URLPORT = 'data-docker-urlport';

// 加载状态和通知类型
export const LOADING_CLASS = 'loading';
export const NOTIFICATION_SUCCESS = 'success';
export const NOTIFICATION_ERROR = 'error';
// 以下内容是contextmenu.js中引用的常量
// config.js

// 右键菜单相关常量
export const CONTEXT_MENU_ID = 'contextMenu';
export const EDIT_GROUP_ITEM_CLASS = 'edit-group-item';
export const DELETE_GROUP_ITEM_CLASS = 'delete-group-item';
export const EDIT_WEBSITE_ITEM_CLASS = 'edit-website-item';
export const DELETE_WEBSITE_ITEM_CLASS = 'delete-website-item';
export const EDIT_DOCKER_ITEM_CLASS = 'edit-docker-item';
export const DELETE_DOCKER_ITEM_CLASS = 'delete-docker-item';

// 数据属性相关常量
// export const DATA_GROUP_ID = 'data-group-id';
// export const DATA_WEBSITE_ID = 'data-website-id';
export const DATA_ITEM_ID = 'data-item-id';
// export const DATA_DOCKER_ID = 'data-docker-id';
export const DATA_GROUP_TYPE = 'data-group-type';//只涉及contextmenu.js

// 分组类型相关常量
// export const GROUP_TYPE_WEBSITE = 'website-group';
// export const GROUP_TYPE_DOCKER = 'docker-group';

// 菜单项文本
export const MENU_TEXT_EDIT_GROUP = '编辑分组';
export const MENU_TEXT_DELETE_GROUP = '删除分组';
export const MENU_TEXT_EDIT_WEBSITE = '编辑网站';
export const MENU_TEXT_DELETE_WEBSITE = '删除网站';
export const MENU_TEXT_EDIT_DOCKER = '编辑 Docker';
export const MENU_TEXT_DELETE_DOCKER = '删除 Docker';

// 事件类型
export const EVENT_CONTEXTMENU = 'contextmenu';
// 

// 正则表达式相关常量
export const REGEX_WEBSITE_GROUP_ID = /website-group-title-([0-9a-fA-F-]+)/;
export const REGEX_DOCKER_GROUP_ID = /docker-group-title-([0-9a-fA-F-]+)/;
// 以下内容是dockeroperationgservice.js中引用的常量
// config.js

// 模态框相关常量
export const DOCKER_MODAL_ID = 'dockerModal';

// 输入框 ID 相关常量
export const INPUT_ID_DOCKER_DISPLAY_NAME = 'dockerDisplayName';
export const INPUT_ID_DOCKER_NAME = 'dockerName';
export const INPUT_ID_ACCESS_IP = 'accessIp';
export const INPUT_ID_ACCESS_PORT = 'accessPort';
export const INPUT_ID_DOCKER_API_ADDRESS = 'dockerApiAddress';
export const INPUT_ID_DOCKER_API_PORT = 'dockerApiPort';
export const INPUT_ID_DOCKER_DESCRIPTION = 'dockerDescription';

// 选择框 ID 相关常量
export const SELECT_ID_GROUP_SELECT = 'groupSelect';

// 数据属性相关常量
// export const DATA_DOCKER_ID = 'data-docker-id';
// export const DATA_DOCKER_SERVER_IP = 'data-docker-server-ip';
// export const DATA_DOCKER_SERVER_PORT = 'data-docker-server-port';
// export const DATA_DESCRIPTION = 'data-description';
// export const DATA_GROUP_ID = 'data-group-id';

// 模态框标题
export const MODAL_TITLE_EDIT_DOCKER = '编辑 Docker 容器';
export const MODAL_TITLE_ADD_DOCKER = '添加 Docker 容器';

// 按钮类名
// export const BUTTON_CLASS_SAVE = 'save-modal-button';
// export const BUTTON_CLASS_CANCEL = 'cancel-modal-button';

// ARIA 标签
// export const ARIA_LABEL_CLOSE_MODAL = '关闭模态框';
// export const ARIA_LABEL_SAVE = '保存';
// export const ARIA_LABEL_CANCEL = '取消';

// 以下内容是dockerinteractiong.js中引用的常量
// config.js

// 通知消息
export const NOTIFICATION_ADD_DOCKER_FAIL = '添加 Docker 失败';
export const NOTIFICATION_DELETE_DOCKER_FAIL = '删除 Docker 失败';

// 模态框相关常量
export const MODAL_TITLE_DELETE_DOCKER = '删除分组';
export const MODAL_OPTION_PERMANENT_DELETE = '永久删除网站';
export const MODAL_OPTION_MOVE_TO_TRASH = '将网站移动到回收站';

// 数据属性相关常量
export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// 通知类型
export const NOTIFICATION_TYPE_ERROR = 'error';

// 以下内容是dockertooltipservice.js中引用的常量
// config.js

// 工具提示相关常量
export const CLASS_DOCKER_TOOLTIP = 'docker-tooltip';

// 数据属性相关常量
// export const DATA_DOCKER_SERVER_PORT = 'data-docker-server-port';
// export const DATA_DOCKER_SERVER_IP = 'data-docker-server-ip';
// export const DATA_DESCRIPTION = 'data-description';
// export const DATA_DOCKER_ID = 'data-docker-id';

// 工具提示内容模板
export const TOOLTIP_CONTENT_TEMPLATE = `
  <div class="${CLASS_DOCKER_TOOLTIP}">
    <p>Docker Name: {{name}}</p>
    <p>URL Port: {{urlPort}}</p>
    <p>Server: {{server}}</p>
    <p>Server Port: {{serverPort}}</p>
    <p>备注: {{description}}</p>
  </div>
`;

// 默认占位符
export const DEFAULT_PLACEHOLDER = 'N/A';

// 配置对象中的键
export const CONFIG_HOVER_DELAY = 'hoverDelay';
export const CONFIG_AUTO_CLOSE_DELAY = 'autoCloseDelay';
export const CONFIG_DEBOUNCE_DELAY = 'debounceDelay';
export const CONFIG_CACHE_EXPIRATION = 'cache.expiration';
export const CONFIG_MAX_CONCURRENT_REQUESTS = 'maxConcurrentRequests';
export const CONFIG_REQUEST_MERGE_THRESHOLD = 'requestMergeThreshold';


// 以下内容是groupinteractionservice.js中引用的常量
// config.js

// 通知消息
export const NOTIFICATION_ADD_GROUP_FAIL = '添加分组失败';
export const NOTIFICATION_EDIT_GROUP_FAIL = '编辑分组失败';
export const NOTIFICATION_DELETE_GROUP_FAIL = '删除分组失败';

// 模态框相关常量
export const MODAL_TITLE_DELETE_GROUP = '删除分组';
// export const MODAL_OPTION_PERMANENT_DELETE = '永久删除分组和网站';
// export const MODAL_OPTION_MOVE_TO_TRASH = '将网站移动到回收站';

// 数据属性相关常量
// export const DATA_GROUP_ID = 'data-group-id';
// export const DATA_GROUP_TYPE = 'data-group-type';
export const DATA_DASHBOARD_TYPE = 'data-dashboard-type';

// 分组类型和仪表盘类型
// export const GROUP_TYPE_WEBSITE = 'website-group';
// export const GROUP_TYPE_DOCKER = 'docker-group';
// export const DASHBOARD_TYPE_WEBSITE = 'website';
// export const DASHBOARD_TYPE_DOCKER = 'docker';

// 删除选项 ID
// export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
// export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// 默认分组类型
export const DEFAULT_GROUP_TYPE = GROUP_TYPE_WEBSITE;

// 选择器模板
export const SELECTOR_GROUP_TEMPLATE = (groupType, groupId) => `.${groupType}[id="${groupId}"]`;//.weroup-group类下id="${groupId}"

// 默认占位符
// export const DEFAULT_PLACEHOLDER = 'N/A';

//以下内容是websiteopreationservice.js中引用的常量
// config.js

// 模态框相关常量
export const WEBSITE_MODAL_ID = 'websiteModal';

// 输入框 ID 相关常量
export const INPUT_ID_NEW_WEBSITE_NAME = 'newWebsiteName';
export const INPUT_ID_NEW_WEBSITE_URL = 'newWebsiteUrl';
export const INPUT_ID_NEW_WEBSITE_DESCRIPTION = 'newWebsiteDescription';

// 选择框 ID 相关常量
// export const SELECT_ID_GROUP_SELECT = 'groupSelect';

// 数据属性相关常量
// export const DATA_WEBSITE_ID = 'data-website-id';
// export const DATA_DESCRIPTION = 'data-description';
// export const DATA_GROUP_ID = 'data-group-id';

// 模态框标题
export const MODAL_TITLE_EDIT_WEBSITE = '编辑网站';
export const MODAL_TITLE_ADD_WEBSITE = '添加网站';

// 按钮类名
// export const BUTTON_CLASS_SAVE = 'save-modal-button';
// export const BUTTON_CLASS_CANCEL = 'cancel-modal-button';

// ARIA 标签
// export const ARIA_LABEL_CLOSE_MODAL = '关闭模态框';
// export const ARIA_LABEL_SAVE = '保存';
// export const ARIA_LABEL_CANCEL = '取消';

// 模式类型
export const MODE_EDIT = 'edit';
export const MODE_ADD = 'add';

// 错误消息
export const ERROR_INVALID_WEBSITE_ID = 'websiteId must be a string when provided';
export const ERROR_INVALID_MODE = 'Invalid mode';
export const ERROR_INVALID_CALLBACK = 'Invalid callback';
export const ERROR_WEBSITE_ID_IN_ADD_MODE = 'websiteId should be empty in add mode';

// HTML 元素选择器模板
export const SELECTOR_WEBSITE_ITEM_TEMPLATE = (websiteId) => `.website-item[${DATA_ITEM_ID}="${websiteId}"]`;//这个很棒,在获取网站信息，docker信息的时候用到,和SELECTOR_GROUP_TEMPLATE一样的用法

//以下内容是websiteinteractionservice.js中引用的常量
// config.js

// 通知消息
export const NOTIFICATION_ADD_WEBSITE_FAIL = '添加网站失败';
export const NOTIFICATION_DELETE_WEBSITE_FAIL = '删除网站失败';
export const NOTIFICATION_OPEN_IMPORT_MODAL_FAIL = '打开导入界面失败';
export const NOTIFICATION_IMPORT_CANCELLED = '导入已取消';

// 模态框相关常量
export const MODAL_TITLE_DELETE_WEBSITE = '删除网站';
// export const MODAL_OPTION_PERMANENT_DELETE = '永久删除网站';
// export const MODAL_OPTION_MOVE_TO_TRASH = '将网站移动到回收站';

// 数据属性相关常量
// export const DATA_WEBSITE_ID = 'data-website-id';
// export const DATA_DESCRIPTION = 'data-description';
// export const DATA_GROUP_ID = 'data-group-id';

// 删除选项 ID
// export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
// export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// 默认占位符
// export const DEFAULT_PLACEHOLDER = 'N/A';

// 后端 API 路径
export const API_PATH_FETCH_ICON = '/favicon?url=';

// HTML 元素选择器模板
// export const SELECTOR_WEBSITE_ITEM_TEMPLATE = (websiteId) => `.website-item[${DATA_WEBSITE_ID}="${websiteId}"]`;

// 错误消息
export const ERROR_TARGET_ELEMENT_REQUIRED = 'Target element is required';
export const ERROR_WEBSITE_ID_REQUIRED = 'websiteId is required';

//以下内容是dockerdataservice.js中引用的常量
// config.js

// 通知消息
export const NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL = '创建默认分组失败';
export const NOTIFICATION_DOCKER_UPDATE_SUCCESS = '容器更新成功';
export const NOTIFICATION_DOCKER_CREATE_SUCCESS = '容器创建成功';
export const NOTIFICATION_SAVE_DOCKER_FAIL = '保存容器失败，请重试';
export const NOTIFICATION_DOCKER_DELETE_SUCCESS = '容器删除成功';
// export const NOTIFICATION_DELETE_DOCKER_FAIL = '删除容器失败，请重试';

// 默认分组名称
export const DEFAULT_GROUP_NAME = 'Default';

// 数据属性相关常量
export const DATA_DOCKER_DATA = 'dockerData';

// 删除选项 ID
// export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
// export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// API 方法名
// export const API_METHOD_CREATE_DOCKER_GROUP = 'createDockerGroup';
export const API_METHOD_GET_DOCKER_GROUPS = 'getDockerGroups';

// 错误消息
export const ERROR_FETCH_OR_CREATE_DEFAULT_GROUP = 'Failed to fetch or create default group:';

//以下内容是groupdataservice.js中引用的常量
// config.js

// 通知消息
export const NOTIFICATION_GROUP_UPDATE_SUCCESS = '分组更新成功';
export const NOTIFICATION_GROUP_CREATE_SUCCESS = '分组创建成功';
export const NOTIFICATION_SAVE_GROUP_FAIL = '保存分组失败，请重试';
export const NOTIFICATION_GROUP_DELETE_SUCCESS = '分组删除成功';
// export const NOTIFICATION_DELETE_GROUP_FAIL = '删除分组失败，请重试';

// 分组类型
// export const GROUP_TYPE_WEBSITE = 'website-group';
// export const GROUP_TYPE_DOCKER = 'docker-group';

// 删除选项 ID
// export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
// export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// API 方法名
export const API_METHOD_CREATE_WEBSITE_GROUP = 'createWebsiteGroup';
export const API_METHOD_UPDATE_WEBSITE_GROUP = 'updateWebsiteGroup';
export const API_METHOD_DELETE_WEBSITE_GROUP = 'deleteWebsiteGroup';
export const API_METHOD_CREATE_DOCKER_GROUP = 'createDockerGroup';
export const API_METHOD_UPDATE_DOCKER_GROUP = 'updateDockerGroup';
export const API_METHOD_DELETE_DOCKER_GROUP = 'deleteDockerGroup';

// 仪表盘类型
// export const DASHBOARD_TYPE_WEBSITE = 'website';
// export const DASHBOARD_TYPE_DOCKER = 'docker';

// 错误消息
export const ERROR_FAILED_TO_SAVE_GROUP = 'Failed to save group:';
export const ERROR_FAILED_TO_DELETE_GROUP = 'Failed to delete group:';

// 以下是websitedataservice.js中引用的常量
// config.js

// 通知消息
// export const NOTIFICATION_CREATE_DEFAULT_GROUP_FAIL = '创建默认分组失败';
export const NOTIFICATION_WEBSITE_UPDATE_SUCCESS = '网站更新成功';
export const NOTIFICATION_WEBSITE_CREATE_SUCCESS = '网站创建成功';
export const NOTIFICATION_SAVE_WEBSITE_FAIL = '保存网站失败，请重试';
export const NOTIFICATION_WEBSITE_DELETE_SUCCESS = '网站删除成功';
export const NOTIFICATION_WEBSITE_MOVED_TO_TRASH = '网站已移动到回收站';
// export const NOTIFICATION_DELETE_WEBSITE_FAIL = '删除网站失败，请重试';
export const NOTIFICATION_WEBSITE_MOVE_SUCCESS = '网站移动成功';
export const NOTIFICATION_MOVE_WEBSITE_FAIL = '移动网站失败，请重试';
export const NOTIFICATION_NO_VALID_WEBSITES = '没有检测到有效的网站数据';
export const NOTIFICATION_NO_VALID_URLS = '没有有效的URL';

// 默认分组名称
// export const DEFAULT_GROUP_NAME = 'Default';

// 数据属性相关常量
export const DATA_NAME = 'name';
export const DATA_URL = 'url';
// export const DATA_DESCRIPTION = 'description';

// 删除选项 ID
// export const OPTION_ID_PERMANENT_DELETE = 'permanentDelete';
// export const OPTION_ID_MOVE_TO_TRASH = 'moveToTrash';

// API 方法名
// export const API_METHOD_CREATE_WEBSITE_GROUP = 'createWebsiteGroup';
export const API_METHOD_GET_WEBSITE_GROUPS = 'getWebsiteGroups';
export const API_METHOD_BATCH_IMPORT_WEBSITES = 'batchImportWebsites';

// 错误消息
// export const ERROR_FETCH_OR_CREATE_DEFAULT_GROUP = 'Failed to fetch or create default group:';

//以下是themeservice.js中引用的常量
// config.js

// 通知消息模板
export const NOTIFICATION_THEME_CHANGED = '主题切换到: ';

// 数据属性相关常量
export const DATA_ATTRIBUTE_THEME = 'data-theme';
export const DATA_ATTRIBUTE_THEME_OPTION = 'theme';

// CSS 类名
export const CLASS_THEME_SWITCHER_OPTION = 'theme-switcher__option';
export const CLASS_ACTIVE = 'active';
export const CLASS_SHOW = 'show';

// localStorage 键
export const LOCAL_STORAGE_KEY_THEME = 'theme';
export const LOCAL_STORAGE_KEY_USED_THEMES = 'usedThemes';

// HTML 元素 ID 和选择器
export const SELECTOR_THEME_SWITCHER_TOGGLE = '#theme-switcher-toggle';
export const SELECTOR_THEME_SWITCHER_OPTIONS = '.theme-switcher__options';
export const SELECTOR_RANDOM_THEME_BUTTON = '#random-theme-button';

// 错误消息
export const ERROR_SAVE_THEME_TO_LOCAL_STORAGE = 'Failed to save theme to localStorage:';

// 主题列表
export const THEME_LIST = [
    'green-bean',
    'galaxy-white',
    'almond-yellow',
    'autumn-leaf-brown',
    'rouge-red',
    'sea-sky-blue',
    'lotus-purple',
    'aurora-gray',
    'grass-green',
    'computer-manager',
    'wps-eye-care',
    'eye-parchment',
];
//h2 标签的随机颜色utils.js
export const RANDOM_COLORS = [
    '#2563eb', // blue
    '#7c3aed', // purple
    '#db2777', // pink
    '#059669', // emerald
    '#d97706', // amber
    '#dc2626', // red
    '#4f46e5', // indigo
    '#0891b2', // cyan
    '#ea580c', // orange
    '#7e22ce'  // violet
  ];
  
  // 背景图片列表
  export const BACKGROUND_IMAGES = [
    'url("./background/background1.png")',
    'url("./background/background2.png")',
    'url("./background/background3.png")',
    'url("./background/background4.png")',
    'url("./background/background5.png")',
    'url("./background/background6.png")',
    'url("./background/background7.png")',
    'url("./background/background8.png")',
    'url("./background/background9.png")',
    'url("./background/background10.png")',
    'url("./background/background11.webm")',
    'url("./background/background12.png")',
    // ... 可以添加更多背景图片路径
  ];