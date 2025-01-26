# 前端组件列表和 CSS 文件组织建议 (基于 index.html 和 script.js)

## 前端组件列表 (基于 `index.html` 和 `script.js`)

1. **SearchInput (搜索输入框)**:

   - 用于搜索网站名称或网址的输入框 (`<input type="search" class="search-input" id="search-input">`)。
   - 对应 CSS 文件: `components/search/search-base.css`, `components/search/search-states.css`
2. **IconButton (图标按钮)**:

   - 通用的图标按钮组件，用于各种操作，例如添加分组、添加网站、切换主题、导入导出数据等 (`<button class="icon-button">`)。
   - 对应 CSS 文件: `components/buttons/base-button.css`, `components/buttons/icon-button.css`, `components/buttons/action-button.css` (可以根据功能细分)
3. **ThemeOption (主题选项按钮)**:

   - 用于选择不同主题的按钮 (亮色、暗色、护眼主题) (`<button class="theme-option">`)。
   - 对应 CSS 文件: `components/theme-selector/theme-selector-base.css`, `components/theme-selector/theme-selector-states.css`, `components/theme-selector/theme-selector-preview.css`
4. **ThemeToggle (主题切换按钮)**:

   - 用于展开/收起主题选项的切换按钮 (`<button id="themeToggle" class="icon-button">`)。
   - 对应 CSS 文件:  `components/theme-selector/theme-selector-base.css`, `components/theme-selector/theme-selector-states.css`, `components/theme-selector/theme-selector-animations.css` (与 ThemeOption 共用部分样式)
5. **ToggleButton (切换按钮)**:

   - 通用的切换状态按钮，例如 "标题随机颜色" 按钮、"切换添加按钮" (`<button id="toggleGroupColors" class="icon-button">`, `<button id="toggleAddButtons" type="button">`)。
   - 对应 CSS 文件: `components/buttons/base-button.css`, `components/buttons/icon-button.css`, `components/button.css` (可以与 IconButton 共用部分样式，或单独创建 `toggle-button.css`)
6. **WebsiteItem (网站列表项)**:

   - 在仪表盘中展示的每个网站项，包含网站图标、名称、链接等信息 (HTML 中未直接体现，但通过 `dashboardDataService.js` 和 `websiteInteractionService.js` 渲染)。
   - 对应 CSS 文件: `components/website-item/website-item-base.css`, `components/website-item/website-item-states.css`, `components/website-item/website-item-animations.css`
7. **Group (分组)**:

   - 网站分组，用于组织和分类网站 (HTML 中未直接体现，通过 `dashboardDataService.js` 渲染，包含分组标题和 WebsiteList)。
   - 对应 CSS 文件:  `components/group.css` (或 `components/group-item.css`, 如果分组也作为列表项展示)
8. **Tooltip (工具提示)**:

   - 鼠标 hover 在按钮或网站项上时显示的提示信息 (`<div id="tooltip">`, 通过 `utils.js` 中的 `showTooltip` 和 `hideTooltip` 函数控制显示隐藏)。
   - 对应 CSS 文件: `components/tooltip/tooltip-base.css`, `components/tooltip/tooltip-themes.css`
9. **Modal (模态框)**:

   - 用于添加分组、添加网站、导入网站时弹出的模态框 (HTML 中未直接体现，通过 `modalInteractionService.js` 控制显示隐藏，可能动态创建)。
   - 对应 CSS 文件: `components/modals/modal-base.css`, `components/modals/modal-form.css`, `components/modals/modal-overlay.css`
10. **ContextMenu (上下文菜单)**:

    - 右键点击网站项或分组时弹出的菜单 (HTML 中未直接体现，通过 `contextMenu.js` 中的 `createContextMenu`, `showGroupContextMenu`, `showWebsiteContextMenu` 函数控制创建和显示)。
    - 对应 CSS 文件: `components/context-menu.css`, `components/menu/menu-base.css`, `components/menu/menu-items.css`, `components/menu/menu-states.css` (可以与 Menu 组件共用样式)
11. **Notification (通知)**:

    - 操作成功或失败时显示的通知消息 (HTML 中未直接体现，通过 `dashboardDataService.js` 中的 `showNotification` 函数控制显示，可能动态创建)。
    - 对应 CSS 文件: `components/notification/notification-base.css`, `components/notification/notification-types.css`
12. **Dashboard (仪表盘)**:

    - 整体页面布局和网站/分组展示区域 (`<main id="dashboard">`)。  虽然 `dashboard` 本身更多是布局容器，但也可以为其定义一些基础样式，例如内边距、背景色等 (如果需要)。
    - 对应 CSS 文件:  `layout/dashboard.css` (或直接使用 `layout/layout.css` 或 `layout/containers.css`，根据实际布局需求决定)
13. **AddButtons (添加按钮组)**:

    - 包含 "添加分组"、"添加网站" 等按钮的容器，可以展开/收起 (`<div class="add-buttons">`, 通过 `script.js` 中的 `toggleAddButtons` 函数控制显示隐藏和动画)。
    - 对应 CSS 文件:  `components/add-buttons.css` (或将相关样式直接写在 `layout/header.css` 或 `layout/layout.css` 中，如果添加按钮组是页面头部的一部分)
14. **ThemeSelector (主题选择器)**:

    - 包含 ThemeOption 和 ThemeToggle，用于选择和切换主题 (`<div class="theme-toggle-container">`, `<div class="theme-options">`, `<button id="themeToggle">`)。
    - 对应 CSS 文件:  `components/theme-selector/theme-selector-base.css`, `components/theme-selector/theme-selector-states.css`, `components/theme-selector/theme-selector-preview.css`, `components/theme-selector/theme-selector-animations.css` (以及 `theme-option.css`, `theme-toggle.css`，如果需要更细分)
15. **GroupList (分组列表)**:

    - 展示多个 Group 组件的列表 (HTML 中未直接体现，作为 Dashboard 的一部分动态渲染)。
    - 对应 CSS 文件:  `components/group-list.css` (或将样式直接写在 `layout/dashboard.css` 中，如果分组列表是仪表盘布局的一部分)
16. **WebsiteList (网站列表)**:

    - 展示多个 WebsiteItem 组件的列表 (HTML 中未直接体现，作为 Group 的一部分动态渲染)。
    - 对应 CSS 文件:  `components/website-list.css` (或将样式直接写在 `components/group.css` 或 `components/website-item.css` 中，根据实际组件嵌套关系决定)

## CSS 文件组织建议:

- 在 `components/` 目录下，为每个组件创建一个或多个 CSS 文件。
- 对于简单的组件 (例如 IconButton, ThemeOption)，可以只创建一个 CSS 文件 (`components/button.css`, `components/theme-option.css`)。
- 对于复杂的组件 (例如 Modal, Menu, WebsiteItem, ThemeSelector, Search)，可以创建子目录，并在子目录下创建更细分的 CSS 文件，例如 `components/modals/modal-base.css`, `components/modals/modal-form.css`, `components/search/search-base.css`, `components/search/search-results.css`。
- 可以创建 `components/base.css` 或 `components/component-base.css` 文件，用于存放所有组件通用的基础样式。
