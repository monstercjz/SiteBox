# CSS 样式整体架构

前端项目的 CSS 样式架构采用了模块化和分层结构的设计，主要分为以下几个模块：

## 1. 主题系统 (Theme System)

功能: 负责管理和切换应用的主题风格，包括基础主题、亮色主题、暗色主题和护眼主题。

特点: 主题样式集中管理，易于切换和扩展新的主题。

## 2. 布局系统 (Layout System)

功能: 负责页面的整体布局结构，包括网格系统、间距、定位和容器布局。
特点: 布局样式模块化，方便构建各种页面布局，并保持布局的一致性。

## 3. 组件样式 (Components)

功能: 负责项目中各种 UI 组件的样式，例如按钮、模态框、工具提示、表单、菜单、主题选择器和网站条目等。

特点: 组件样式独立封装，易于组件的复用和维护。组件内部进一步细分样式文件，结构清晰。

## 4. 状态系统 (States)

功能: 负责定义组件在不同状态下的样式，例如交互状态 (hover, active, focus) 和动画效果。

特点: 状态样式集中管理，减少了组件样式文件中的状态样式代码，提高了代码复用率。

## 5. 工具类 (Utilities)

功能: 提供一系列通用的、原子化的工具类，用于快速设置排版、Flex 布局、无障碍和响应式等样式。

特点: 工具类样式原子化程度高，方便在 HTML 中直接使用，提高了开发效率和样式复用率。
总体架构特点:

## 总结
模块化: CSS 样式按照功能模块进行划分，结构清晰，易于维护。
分层结构: 模块内部也存在分层结构，例如组件样式模块，方便代码组织和管理。
关注点分离: 不同模块负责不同的样式功能，职责明确。
高可维护性: 模块化和分层结构提高了 CSS 代码的可维护性。
高可复用性: 工具类和组件样式具有较高的可复用性。

# CSS 模块化组件生成规范

## 核心需求

检查由复杂组件的 CSS 样式拆分为 **职责单一、边界清晰的子模块**，确保每个子模块的代码所属归类正确，满足以下规则：

---

## 1. 模块划分标准
### 基本原则
- **单一职责原则**：每个模块仅解决一个特定问题
- **功能边界清晰**：模块间无样式交叉依赖

### 强制模块清单
| 模块名称     | 作用域描述              | 文件命名示例            |
| ------------ | ----------------------- | ----------------------- |
| `base`       | 基础布局与结构定义      | `Button.base.css`       |
| `theme`      | 视觉风格与 CSS 变量管理 | `Button.theme.css`      |
| `states`     | 交互状态管理            | `Button.states.css`     |
| `animations` | 过渡与动画实现          | `Button.animations.css` |
| `variants`   | 组件变体与功能扩展      | `Button.variants.css`   |
| `responsive` | 响应式适配规则          | `Button.responsive.css` |

### 可选扩展模块

- `utilities`: 原子化工具类 (如 `.mt-1`, `.text-center`)
- `config`: 全局配置变量
### 模块补全
- 如果某个强制模块不存在，则创建一个空文件，并添加注释说明其职责。例如

---

## 2. 模块职责边界
| 模块名称       | 允许包含内容                       | 禁止包含内容               |
| -------------- | ---------------------------------- | -------------------------- |
| **base**       | `display`, `position`, `grid/flex` | 颜色值、字体样式、阴影效果 |
| **theme**      | CSS 变量、颜色方案、字体栈         | 布局规则、动画定义         |
| **states**     | `:hover`, `:active`, 状态类名      | 固定尺寸、复杂动画逻辑     |
| **animations** | `transition`, `@keyframes`         | 响应式断点、主题变量引用   |
| **variants**   | 尺寸变体、功能扩展样式             | 全局工具类、基础布局覆盖   |
| **responsive** | 媒体查询、容器查询、视口单位适配   | 非响应式相关的状态样式     |

---

## 3. 技术实现规范
### 命名体系
```css
/* BEM 规范示例 */
.component { /* Block */ }
.component__item { /* Element */ }
.component--active { /* Modifier */ }

/* 状态类命名 */
.is-disabled { color: var(--disabled-color) }
```

### 变量管理
```css
/* theme 模块中定义 */
:root {
  --color-primary: #007bff;
  --spacing-unit: 8px;
}

/* 组件级变量 */
.component {
  --local-size: calc(var(--spacing-unit) * 3);
}
```

### 响应式优先级
```markdown
加载顺序：base → theme → variants → states → animations → responsive
```

---

## 4. 文件组织结构
```tree
[ComponentName]/
├── [ComponentName].css           # 主入口文件
├── base/
│   └── [ComponentName].base.css  # 布局定义
├── theme/
│   └── [ComponentName].theme.css # 视觉变量
├── states/
│   └── [ComponentName].states.css # 状态管理
├── animations/
│   └── [ComponentName].animations.css # 动画逻辑
├── variants/
│   └── [ComponentName].variants.css # 变体扩展
└── responsive/
    └── [ComponentName].responsive.css # 响应式规则
```

---

## 5. 质量保障标准
### 可维护性指标
| 指标           | 要求   | 检测工具     |
| -------------- | ------ | ------------ |
| 模块耦合度     | < 15%  | css-analyzer |
| 选择器嵌套深度 | ≤ 3 层 | Stylelint    |
| 重复代码率     | < 5%   | CSS Stats    |
| 未使用样式占比 | < 2%   | PurgeCSS     |

### 性能优化
```css
/* 动画优化示例 */
.optimized-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 6. 验收条件
1. **变量隔离性**  
   修改 `theme` 模块变量不破坏其他模块

2. **状态联动性**  
   `states` 模块设置 `.is-disabled` 时自动禁用 `animations`

3. **响应式覆盖**  
   `responsive` 的移动端样式完全覆盖 `base` 桌面端规则

4. **特异性一致性**  
   所有模块选择器优先级相同（禁用 `!important`）

5. **渲染性能**  
   CSS 渲染耗时 ≤ 15ms（Chrome Performance 测量）
```