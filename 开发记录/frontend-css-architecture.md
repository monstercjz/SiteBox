# 前端 CSS 代码架构 (基于 Base, Layout, Modules, State, Theme, Utilities)

根据您提供的 CSS 代码架构划分方式 (Base, Layout, Modules, State, Theme) 以及我的进一步思考，我对架构进行了细化和完善，增加了 **Utilities (工具类)** 作为一个顶层类别，并细化了每个类别的内容。

## 1. Base (基础样式)

**目的**:  定义全局最基础的样式，作为整个项目样式的基础和起点。

**包含内容**:

- **Reset 样式**:

  - 消除不同浏览器默认样式的差异，确保页面在不同浏览器中具有一致的初始表现。
  - 示例文件: `base/reset.css`, `core/reset.css` 或 `reset.css`
  - 内容:  重置或统一 HTML 元素的 margin, padding, font-size, line-height 等默认样式。
- **Typography (排版)**:

  - 定义全局的字体、字号、行高、文本颜色等基础排版样式。
  - 示例文件: `base/typography.css`, `core/typography.css` 或 `typography.css`
  - 内容:  设置 `body` 默认字体、标题 (`h1-h6`)、段落 (`p`)、链接 (`a`) 等文本元素的默认样式。
- **Base Theme Variables (基础主题变量)**:

  - 定义基础主题的颜色、字体、间距等变量，供其他样式模块和主题样式使用。
  - 示例文件: `themes/base-theme.css`, `core/variables.css` 或 `base/variables.css`
  - 内容:  定义 CSS 自定义属性 (变量)，例如 `--color-primary`, `--color-secondary`, `--font-family-base`, `--spacing-base` 等。
- **Accessibility (可访问性)**:

  - 定义可访问性相关的基础样式，增强网站的可访问性。
  - 示例文件: `base/accessibility.css` 或 `core/accessibility.css`
  - 内容:  定义 focus 状态的通用样式 (例如 focus indicator),  `aria-label` 和 `aria-hidden` 等属性的样式，屏幕阅读器友好的样式等。
- **Core 样式 (可选，如果以上内容需要合并)**:

  - 如果 Reset, Typography, Base Theme Variables, Accessibility 相关样式比较基础和通用，可以考虑合并到一个 `core.css` 文件中。
  - 示例文件: `core/core.css` 或 `base/core.css`
  - 内容:  包含 Reset 样式、Typography 样式、Base Theme Variables、Accessibility 样式等基础样式定义。

## 2. Layout (布局样式)

**目的**:  定义页面整体布局结构和页面的宏观结构。

**包含内容**:

- **Containers (容器)**:

  - 定义页面内容容器的样式，用于控制页面内容区域的宽度、居中、内外边距等。
  - 示例文件: `layout/containers.css` 或 `layout/container.css`
  - 内容:  定义 `.container` 等容器类的最大宽度 (`max-width`)、居中方式 (`margin: 0 auto`)、内边距 (`padding`) 等。
- **Grid System (网格系统)**:

  - 定义网格系统样式，用于页面分栏布局和组件排列。
  - 示例文件: `layout/grid.css`
  - 内容:  使用 CSS Grid Layout 或 Flexbox 实现的网格类，例如 `.grid-container`, `.grid-row`, `.grid-col-*` 等。
- **Responsive Styles (响应式样式)**:

  - 定义响应式布局相关的样式和断点。
  - 示例文件: `layout/responsive.css` 或 `layout/layout.css`
  - 内容:  使用 `@media` 查询定义不同屏幕尺寸下的布局变化，设置断点变量 (`--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`)。
- **Dashboard Layout (仪表盘布局)**:

  - 定义仪表盘 (`<main id="dashboard">`) 区域的整体布局样式。
  - 示例文件: `layout/dashboard.css` 或 `layout/page.css`
  - 内容:  设置仪表盘区域的内边距、背景色、网格布局或 Flexbox 布局等。
- **AddButtons Layout (添加按钮组布局)**:

  - 定义添加按钮组 (`<div class="add-buttons">`) 的布局样式。
  - 示例文件: `layout/add-buttons.css` 或 `layout/header.css` (如果添加按钮组在头部)
  - 内容:  设置添加按钮组的显示位置、排列方式、展开/收起动画等。
- **ThemeSelector Layout (主题选择器布局)**:

  - 定义主题选择器 (`<div class="theme-toggle-container">`) 的布局样式。
  - 示例文件: `layout/theme-selector.css` 或 `components/theme-selector/theme-selector-layout.css`
  - 内容:  设置主题选择器的位置、排列方式、主题选项按钮的布局等。
- **Overall Page Layout (页面整体布局)**:

  - 定义页面的整体结构布局，例如 header, main content area, footer 等的布局。
  - 示例文件: `layout/layout.css` 或 `layout/main.css`
  - 内容:  定义页面各主要区域的排列方式、宽度、高度等。

## 3. Modules (模块样式 - 原 Components)

**目的**:  定义项目中可复用的 UI 模块 (组件) 的样式，实现模块化和组件化。

**包含内容**:

- **Button 模块**:

  - 按钮组件的各种样式，例如基本按钮、图标按钮、操作按钮等。
  - 示例文件: `modules/button.css`, `modules/buttons/base-button.css`, `modules/buttons/icon-button.css`, `modules/buttons/action-button.css`
- **ThemeOption 模块**:

  - 主题选项按钮组件的样式。
  - 示例文件: `modules/theme-option.css`, `modules/theme-selector/theme-option.css`
- **ThemeToggle 模块**:

  - 主题切换按钮组件的样式。
  - 示例文件: `modules/theme-toggle.css`, `modules/theme-selector/theme-toggle.css`
- **ToggleButton 模块**:

  - 通用切换按钮组件的样式。
  - 示例文件: `modules/toggle-button.css` 或 `modules/button.css` (如果与 Button 模块合并)
- **SearchInput 模块**:

  - 搜索输入框组件的样式。
  - 示例文件: `modules/search-input.css`, `modules/search/search-base.css`
- **WebsiteItem 模块**:

  - 网站列表项组件的样式。
  - 示例文件: `modules/website-item.css`, `modules/website-item/website-item-base.css`
- **Group 模块**:

  - 分组组件的样式。
  - 示例文件: `modules/group.css`, `modules/group-item.css`
- **Tooltip 模块**:

  - 工具提示组件的样式。
  - 示例文件: `modules/tooltip.css`, `modules/tooltip/tooltip-base.css`
- **Modal 模块**:

  - 模态框组件的样式。
  - 示例文件: `modules/modal.css`, `modules/modals/modal-base.css`
- **ContextMenu 模块**:

  - 上下文菜单组件的样式。
  - 示例文件: `modules/context-menu.css`, `modules/menu/menu-base.css`
- **Notification 模块**:

  - 通知组件的样式。
  - 示例文件: `modules/notification.css`, `modules/notification/notification-base.css`
- **ThemeSelector 模块**:

  - 主题选择器组件的样式 (包含 ThemeOption 和 ThemeToggle)。
  - 示例文件: `modules/theme-selector.css`, `modules/theme-selector/theme-selector-base.css`
- **通用模块基础样式**:

  - 定义所有模块通用的基础样式，例如统一的字体、颜色、间距等。
  - 示例文件: `modules/base.css`, `modules/component-base.css` 或 `modules/modules-base.css`

## 4. State (状态样式)

**目的**:  定义模块在不同状态下的样式，例如交互状态、选中状态、禁用状态等，增强用户体验。

**包含内容**:

- **Interactions (交互状态)**:

  - 定义模块在鼠标 hover, focus, active 等交互状态下的样式变化。
  - 示例文件: `state/interactions.css` 或 `states/interactions.css`
  - 内容:  定义 `:hover`, `:focus`, `:active` 等伪类选择器的样式，例如按钮 hover 时的背景色变化、链接 focus 时的下划线等。
- **Animations (动画)**:

  - 定义模块的动画和过渡效果，例如组件显示/隐藏动画、状态切换动画等。
  - 示例文件: `state/animations.css` 或 `states/animations.css`
  - 内容:  定义 `@keyframes` 动画和 `transition` 过渡效果，例如模态框的淡入淡出动画、按钮的点击反馈动画等。
- **模块状态样式 (Module States)**:

  - 可以为特定模块创建单独的状态样式文件，例如 SearchInput, WebsiteItem, Menu, ThemeSelector 等。
  - 示例文件:
    - `modules/search/search-states.css`
    - `modules/website-item/website-item-states.css`
    - `modules/menu/menu-states.css`
    - `modules/theme-selector/theme-selector-states.css`
  - 内容:  定义特定模块在不同状态下的样式，例如搜索框 focus 时的边框颜色、网站项 selected 时的背景色、菜单项 hover 时的背景色等。

## 5. Theme (主题样式)

**目的**:  定义网站的不同主题视觉风格，例如亮色主题、暗色主题、护眼主题等，实现主题切换功能。

**包含内容**:

- **Theme Files (主题文件)**:

  - 定义不同主题的样式文件，例如亮色主题、暗色主题、护眼主题等。
  - 示例文件: `themes/light-theme.css`, `themes/dark-theme.css`, `themes/eye-care-theme.css`
  - 内容:  在每个主题文件中，覆盖或修改 Base Theme Variables 中定义的颜色、字体等变量，以及其他需要主题化的样式。
- **Theme Variables (主题变量 - 可选，如果 Base Theme Variables 已足够)**:

  - 如果需要在 Theme 目录下单独管理主题变量，可以创建 `themes/variables.css` 文件。
  - 示例文件: `themes/variables.css`
  - 内容:  定义主题相关的颜色、字体、背景等变量，可以在不同的主题文件中引用和修改这些变量。
- **Theme-specific Module Styles (主题特定的模块样式 - 可选)**:

  - 如果某些模块需要在不同主题下有较大的样式差异，可以创建主题特定的模块样式文件。
  - 示例文件:
    - `modules/tooltip/tooltip-themes.css`
    - `modules/theme-selector/theme-selector-themes.css`
  - 内容:  定义特定模块在不同主题下的特殊样式，例如工具提示在暗色主题下的背景色和文字颜色、主题选择器在不同主题下的外观等。

## 6. Utilities (工具类样式)

**目的**:  提供小的、可复用的工具类，用于快速应用样式，提高开发效率和样式复用性。

**包含内容**:

- **Layout Utilities (布局工具类)**:

  - 用于快速进行页面布局和元素排列的工具类，之前在 Layout 类别中已包含部分，现在将其归入 Utilities 类别下。
  - 示例文件: `utilities/layout.css` 或 `utilities/utilities.css` (如果所有工具类合并到一个文件)
  - 内容:  包含 Spacing Utilities (间距工具类), Positioning Utilities (定位工具类), Flexbox Utilities (Flexbox 工具类), Grid Utilities (Grid 工具类 - 如果需要) 等。
- **Text Utilities (文本工具类)**:

  - 用于快速设置文本样式的工具类。
  - 示例文件: `utilities/text.css` 或 `utilities/typography.css` (如果与基础排版样式合并) 或 `utilities/utilities.css`
  - 内容:  定义 `u-text-center`, `u-text-left`, `u-text-right`, `u-text-bold`, `u-text-italic`, `u-text-uppercase` 等工具类。
- **Color Utilities (颜色工具类)**:

  - 用于快速设置文本颜色、背景颜色、边框颜色等的工具类。
  - 示例文件: `utilities/color.css` 或 `utilities/utilities.css`
  - 内容:  定义 `u-color-primary`, `u-color-secondary`, `u-bg-primary`, `u-bg-light`, `u-border-primary` 等工具类。  可以基于 Base Theme Variables 中定义的颜色变量来生成这些工具类。
- **Background Utilities (背景工具类)**:

  - 用于快速设置背景样式，例如背景色、背景图片、背景渐变等的工具类。
  - 示例文件: `utilities/background.css` 或 `utilities/utilities.css`
  - 内容:  定义 `u-bg-light`, `u-bg-dark`, `u-bg-gradient-*` 等工具类。
- **Border Utilities (边框工具类)**:

  - 用于快速设置边框样式，例如边框颜色、边框宽度、边框圆角等的工具类。
  - 示例文件: `utilities/border.css` 或 `utilities/utilities.css`
  - 内容:  定义 `u-border`, `u-border-primary`, `u-border-radius-sm`, `u-border-dashed` 等工具类。
- **Effect Utilities (效果工具类)**:

  - 用于快速应用视觉效果，例如阴影、透明度、滤镜等的工具类。
  - 示例文件: `utilities/effect.css` 或 `utilities/utilities.css`
  - 内容:  定义 `u-shadow-sm`, `u-shadow-lg`, `u-opacity-50`, `u-blur-sm` 等工具类。
- **其他通用工具类**:

  - 可以根据项目需求扩展其他类型的工具类，例如 `utilities/accessibility.css` (可访问性工具类), `utilities/animation.css` (动画工具类), `utilities/cursor.css` (鼠标光标工具类) 等。

**文件组织建议 (更新后)**:

- 创建 `base/`, `layout/`, `modules/`, `state/`, `themes/`, `utilities/` 等顶层目录，分别存放不同类别的 CSS 文件。
- `base/` 目录存放基础样式 (reset, typography, variables, accessibility, core.css)。
- `layout/` 目录存放页面布局样式 (containers, grid, responsive, dashboard.css, add-buttons.css, theme-selector.css, layout.css)。
- `modules/` 目录存放模块 (组件) 样式，并为每个模块创建一个或多个 CSS 文件，可以根据模块的复杂程度创建子目录 (例如 `modules/buttons/`, `modules/modals/`, `modules/search/` 等)。
- `state/` 目录存放状态样式 (interactions.css, animations.css) 以及模块特定的状态样式子文件 (例如 `modules/search/search-states.css`)。
- `themes/` 目录存放主题样式 (light-theme.css, dark-theme.css, eye-care-theme.css, variables.css) 以及主题特定的模块样式子文件 (例如 `modules/tooltip/tooltip-themes.css`)。
- `utilities/` 目录存放工具类样式 (layout.css, text.css, color.css, background.css, border.css, effect.css, utilities.css - 如果需要合并所有工具类到一个文件)。

希望这次更详细的检查和架构完善能够帮助您构建更健壮、更易维护的前端 CSS 代码架构！
