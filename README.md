# SiteBox 网站与 Docker 容器导航

**项目简介：**

SiteBox 是一款个人导航网站，旨在帮助用户更方便地管理和访问常用网站和 Docker 容器。用户可以将网站和 Docker 容器分组，并进行添加、删除、编辑、排序等操作。同时，项目还提供了一些辅助功能，例如网站 Favicon 图标自动获取、数据同步、关键词搜索、主题切换和布局切换等，旨在提升用户日常工作和生活效率。

**主要功能：**

*   **网站分组管理：**
    *   创建、删除、编辑网站分组
    *   分组排序、折叠/展开，自定义分组图标
*   **网站信息管理：**
    *   添加、删除、编辑网站信息
    *   维护网站名称、URL、描述等信息
    *   自动获取网站 Favicon 图标
    *   网站访问历史记录
*   **Docker 容器分组管理：**
    *   创建、删除、编辑 Docker 容器分组
    *   分组排序、折叠/展开，自定义分组图标
*   **Docker 容器管理：**
    *   查看 Docker 容器基本信息 (名称、ID、状态、镜像、创建时间等)
    *   查看 Docker 容器端口映射
    *   包含容器操作 (启动、停止、重启)，删除 Docker 记录
*   **快速访问：**
    *   分组展示网站和 Docker 容器列表
    *   网站和 Docker 容器排序
    *   一键快速打开网站和 Docker 容器管理页面 (如果有)
*   **搜索功能：**
    *   根据关键词快速搜索网站和 Docker 容器 
*   **数据同步与备份：**
    *   网站数据导出和导入
    *   网站数据自动备份功能 (仅备份网站数据，不包含 Docker 容器数据)
*   **主题切换：**
    *   支持多种预设主题，满足不同用户的个性化需求，预设主题包括：
        *   green-bean
        *   galaxy-white
        *   almond-yellow
        *   autumn-leaf-brown
        *   rouge-red
        *   sea-sky-blue
        *   lotus-purple
        *   aurora-gray
        *   grass-green
        *   computer-manager
        *   wps-eye-care
        *   eye-parchment
*   **布局切换：**
    *   支持两种布局模式：默认布局和另一种布局 (Alternative)
*   **用户界面：**
    *   简洁直观的用户界面，易于上手和操作
    *   响应式设计，支持在不同设备上访问

**技术栈：**

*   **前端：**
    *   HTML
    *   CSS (可能使用了 CSS 预处理器或框架)
    *   JavaScript (原生 JavaScript，可能使用了模块化方案)
*   **后端：**
    *   Node.js
    *   Express.js
    *   CORS 中间件处理跨域请求
    *   使用 express.json() 中间件处理 JSON 请求体 (相当于 body-parser.json())
*   **数据存储：**
    *   使用 JSON 文件存储网站、Docker 容器和历史记录数据
*   **部署：**
    *   Docker
    *   Docker Compose
    *   Nginx (用于前端静态资源服务和反向代理)

**部署方式：**

*   **Docker 部署：**
    *   提供 Dockerfile 和 docker-compose.yml 文件，一键部署前后端应用
    *   详细的后端 Docker 镜像构建和运行教程
    *   详细的前端 Docker 镜像构建和运行教程 (使用 Nginx)
*   **前后端分离部署：**
    *   后端 Node.js 应用独立部署 (例如使用 PM2 管理进程)
    *   前端静态文件 (HTML, CSS, JavaScript) 使用 Nginx 或其他 Web 服务器部署
    *   前后端部署教程和配置说明

**使用方法：**

1.  **克隆代码仓库**
2.  **后端部署：**
    *   进入 `backend` 目录：`cd backend`
    *   安装 Node.js 依赖：`npm install`
    *   **配置环境变量：**  `PORT` (后端服务端口号，默认为 3000), `BACKEND_URL` (后端 URL，默认为 http://localhost)。  具体环境变量配置请参考后端配置文件或 Docker Compose 文件。
    *   启动后端服务：`npm start` 或 `node server.js`
    *   *(可选) 使用 Docker Compose 或 Dockerfile 构建和运行后端 Docker 镜像：`docker-compose up -d backend-app`*
    *   *访问后端 API 接口 (例如 `http://localhost:3000/api/`) 验证后端服务是否正常运行*
    *   *访问后端 API 接口 (例如 `http://localhost:3000/api/`) 验证后端服务是否正常运行*
3.  **前端部署：**
    *   进入 `frontend` 目录：`cd frontend`
    *   *修改前端配置文件 (例如 `frontend/config.js` 或环境变量) 中的后端 API 地址，确保前端可以访问到后端 API*
    *   将 `frontend` 目录下的静态文件部署到 Web 服务器 (例如 Nginx)
    *   *(可选) 使用 Dockerfile 构建和运行前端 Docker 镜像：`docker-compose up -d frontend-nginx`*
    *   *访问前端网站 URL (例如 `http://localhost`) 验证前端网站是否正常运行*
    *   *访问前端网站 URL (例如 `http://localhost`) 验证前端网站是否正常运行*
4.  **访问网站：**  通过浏览器访问部署的前端网站 URL

**配套浏览器插件**

**插件名称：** SiteBox 浏览器插件

**插件功能：**

*   **快速保存网站：**  一键保存当前浏览的网站 URL、标题和描述信息到 SiteBox 导航网站。
*   **分组管理：**  保存网站时可以选择网站分组，方便分类管理。
*   **新标签页快速访问：**  替换浏览器默认新标签页，打开新标签页即可快速访问 SiteBox 导航网站。
*   **自定义 API 地址：**  允许用户在插件选项页面配置 SiteBox 后端 API 地址，方便连接到用户自己的 SiteBox 服务。

**安装方式：**

1.  **下载插件代码：**  [请用户自行打包 browser-extension 目录为 zip 文件，并在此处提供下载链接]
2.  **Chrome 浏览器安装：**
    *   打开 Chrome 浏览器，访问 `chrome://extensions/`
    *   开启 "开发者模式" 开关 (位于页面右上角)
    *   点击 "加载已解压的扩展程序" 按钮
    *   选择下载的插件代码目录 `browser-extension` 文件夹，点击 "选择文件夹" 完成安装

**使用方法：**

1.  **配置 API 地址：**
    *   安装插件后，在 Chrome 浏览器地址栏输入 `chrome://extensions/` 打开扩展程序管理页面
    *   找到 "SiteBox" 插件，点击 "选项" 进入插件选项页面
    *   在选项页面中配置 SiteBox 后端 API 地址，例如 `http://localhost:3000`，然后点击 "保存" 按钮
2.  **保存网站：**
    *   在浏览器中打开需要保存的网站页面
    *   点击浏览器工具栏中的 "SiteBox" 插件图标，弹出插件页面
    *   插件会自动获取当前页面的 URL 和标题，用户可以编辑网站描述信息，并选择网站分组
    *   点击 "保存" 按钮，即可将网站信息保存到 SiteBox 导航网站
3.  **新标签页访问：**
    *   安装插件后，打开新的浏览器标签页，即可看到 SiteBox 导航网站界面，方便快速访问常用网站和 Docker 容器

**请注意：**

*   插件功能依赖于已部署的 SiteBox 后端 API 服务，请确保后端 API 服务正常运行，并已在插件选项页面中配置正确的 API 地址。
*   插件目前只提供 Chrome 浏览器版本，其他浏览器版本暂未提供。


**贡献指南：**

*   欢迎提交代码贡献，例如 Bug 修复、功能改进、性能优化等
*   提交代码前请先阅读代码贡献指南，并遵循项目代码风格和规范
*   欢迎提交 Issue 反馈 Bug 或提出 Feature Request

**License：**

*   **License: 本项目未声明开源许可证信息，请联系项目维护者获取更多信息**