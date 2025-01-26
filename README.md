# Personal Dashboard

## Description

This is a personal dashboard application that allows you to organize your favorite websites into groups. It includes a web interface, a backend API, and a browser extension for quick access.

## Features

-   Add, edit, and delete website groups.
-   Add, edit, and delete websites within groups.
-   Data is stored locally in a JSON file.
-   Browser extension for quick access to links.
-   Docker support for easy deployment.

## Getting Started

### Prerequisites

-   Node.js and npm installed
-   Docker installed (optional)

### Local Deployment

1.  **Clone the repository:**

    ```bash
    git clone [repository-url]
    cd personal-dashboard
    ```README.md

2.  **Start the backend server:**

    ```bash
    cd backend
    npm install
    npm start
    ```

    The backend server will be running at `http://localhost:3000`.

3.  **Open the frontend:**

    Open `frontend/index.html` in your browser.

### Docker Deployment

1.  **Build and run the Docker container:**

    ```bash
    docker-compose up --build
    ```

    The application will be accessible at `http://localhost:3000`.

### Browser Extension

1.  **Load the extension in your browser:**
    -   **Chrome/Edge:** Go to `chrome://extensions` or `edge://extensions`, enable "Developer mode", and click "Load unpacked". Select the `browser-extension` directory.
    -   **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `browser-extension/manifest.json` file.

## API Documentation

### Base URL

`http://localhost:3000/api`

### Endpoints

-   **GET /data**: Get all data (groups and websites).
-   **POST /groups**: Add a new group.
    -   Request body: `{ "name": "Group Name" }`
-   **POST /groups/:groupId/websites**: Add a new website to a group.
    -   Request body: `{ "name": "Website Name", "url": "Website URL" }`
-   **DELETE /groups/:groupId**: Delete a group.
-   **DELETE /groups/:groupId/websites/:websiteId**: Delete a website.
-   **PUT /groups/:groupId**: Update a group.
    -   Request body: `{ "name": "New Group Name" }`
-   **PUT /groups/:groupId/websites/:websiteId**: Update a website.
    -   Request body: `{ "name": "New Website Name", "url": "New Website URL" }`

## Browser Extension Usage

-   Click the extension icon to open a popup with a list of your saved links.
-   Click a link to open it in a new tab.

## Security and Privacy

-   Data is stored locally in a JSON file.
-   No user authentication is implemented.
-   Be mindful of the data you store and who has access to your local files.

## Contributing

Feel free to contribute to this project by submitting pull requests.



```
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend .

EXPOSE 3000

CMD ["npm", "start"]
```
```
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
```


后端:
使用 Express.js 创建 RESTful API。
使用 fs 模块读写 JSON 文件存储数据。
提供添加、删除、修改分组和网站的 API。
使用 cors 中间件允许跨域请求。
前端:
使用纯 HTML, CSS 和 JavaScript 构建用户界面。
通过 fetch API 与后端交互。
动态渲染分组和网站列表。
浏览器插件:
使用 WebExtension API 创建浏览器插件。
从后端获取数据并显示快捷链接。
Docker:
提供 Dockerfile 和 Docker Compose 文件，方便部署。