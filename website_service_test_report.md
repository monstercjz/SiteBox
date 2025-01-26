# Website Service 测试报告

## 测试环境

-   **文件路径:** `backend/services/websiteService.js`
-   **数据文件:** `backend/data/sites-data.json`
-   **服务器地址:** `http://localhost:3000`

## 测试用例

### 1. `getWebsitesByGroupId(groupId)`

-   **测试用例 1:** 使用 "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" 作为 `groupId`。
    -   **命令:** `curl http://localhost:3000/websites/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites`
    -   **结果:** 返回包含 "YouTube", "Bilibili", "Test Website", "Test Website 4" 的网站列表。
    -   **判定:** 通过
-   **测试用例 2:** 使用 "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d" 作为 `groupId`。
    -   **命令:** `curl http://localhost:3000/websites/groups/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/websites`
    -   **结果:** 返回包含 "Twitter" 的网站列表。
    -   **判定:** 通过
-   **测试用例 3:** 使用一个不存在的 `groupId` "invalid-group-id"。
    -   **命令:** `curl http://localhost:3000/websites/groups/invalid-group-id/websites`
    -   **结果:** 返回 "无效的 groupId" 错误。
    -   **判定:** 通过

### 2. `getWebsiteById(websiteId)`

-   **测试用例 1:** 使用 "44444444-4444-4444-4444-444444444444" 作为 `websiteId`。
    -   **命令:** `curl http://localhost:3000/websites/44444444-4444-4444-4444-444444444444`
    -   **结果:** 返回 "YouTube" 网站的详细信息。
    -   **判定:** 通过
-   **测试用例 2:** 使用一个不存在的 `websiteId` "invalid-website-id"。
    -   **命令:** `curl http://localhost:3000/websites/invalid-website-id`
    -   **结果:** 抛出 "无效的 websiteId" 错误。
    -   **判定:** 通过

### 3. `createWebsite(groupId, websiteData)`

-   **测试用例 1:** 在 "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" 中创建一个新的网站。
    -   **命令:** `curl -X POST -H "Content-Type: application/json" -d '{"name": "Test Website 4", "url": "https://www.test4.com", "description": "This is a test website 4"}' http://localhost:3000/websites/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites`
    -   **结果:** 成功创建新的网站，并返回新的网站对象。
    -   **判定:** 通过
-   **测试用例 2:** 尝试创建一个 URL 已经存在的网站。
    -   **命令:** `curl -X POST -H "Content-Type: application/json" -d '{"name": "Test Website 5", "url": "https://www.test4.com", "description": "This is a test website 5"}' http://localhost:3000/websites/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites`
    -   **结果:** 抛出 "该网站 URL 已存在" 错误。
    -   **判定:** 通过
-   **测试用例 3:** 尝试在一个不存在的 `groupId` 中创建网站。
    -   **命令:** `curl -X POST -H "Content-Type: application/json" -d '{"name": "Test Website 3", "url": "https://www.test3.com", "description": "This is a test website 3"}' http://localhost:3000/websites/groups/invalid-group-id/websites`
    -   **结果:** 抛出 "无效的网站数据" 错误。
    -   **判定:** 通过

### 4. `updateWebsite(websiteId, websiteData)`

-   **测试用例 1:** 更新 "11111111-1111-1111-1111-111111111111" 的名称和描述。
    -   **命令:** `curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Google", "description": "Updated search engine", "url": "https://www.google.com"}' http://localhost:3000/websites/11111111-1111-1111-1111-111111111111`
    -   **结果:** 成功更新网站信息，并返回更新后的网站对象。
    -   **判定:** 通过
-   **测试用例 2:** 尝试更新一个不存在的 `websiteId`。
    -   **命令:** `curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Google", "description": "Updated search engine", "url": "https://www.google.com"}' http://localhost:3000/websites/invalid-website-id`
    -   **结果:** 抛出 "无效的网站数据" 错误。
    -   **判定:** 通过
-   **测试用例 3:** 尝试更新网站的 URL 为一个已存在的 URL。
    -   **命令:** `curl -X PUT -H "Content-Type: application/json" -d '{"name": "Updated Google", "description": "Updated search engine", "url": "https://www.github.com"}' http://localhost:3000/websites/11111111-1111-1111-1111-111111111111`
    -   **结果:** 抛出 "该网站 URL 已存在" 错误。
    -   **判定:** 通过

### 5. `deleteWebsite(websiteId)`

-   **测试用例 1:** 删除 "11111111-1111-1111-1111-111111111111"。
    -   **命令:** `curl -X DELETE http://localhost:3000/websites/11111111-1111-1111-1111-111111111111`
    -   **结果:** 返回 "{ message: 'Website deleted successfully' }"。
    -   **判定:** 通过
-   **测试用例 2:** 尝试删除一个不存在的 `websiteId`。
    -   **命令:** `curl -X DELETE http://localhost:3000/websites/invalid-website-id`
    -   **结果:** 抛出 "无效的 websiteId" 错误。
    -   **判定:** 通过

### 6. `reorderWebsites(reorderData)`

-   **测试用例 1:** 重新排序 "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" 分组中的网站。
    -   **命令:** `curl -X PATCH -H "Content-Type: application/json" -d '[{"id": "22222222-2222-2222-2222-222222222222"}, {"id": "33333333-3333-3333-3333-333333333333"}]' http://localhost:3000/websites/reorder`
    -   **结果:** 返回重新排序后的网站列表。
    -   **判定:** 通过
-   **测试用例 2:** 尝试使用无效的 `reorderData`。
    -   **命令:** `curl -X PATCH -H "Content-Type: application/json" -d '[{"id": "invalid-website-id"}]' http://localhost:3000/websites/reorder`
    -   **结果:** 抛出 "无效的排序数据" 错误。
    -   **判定:** 通过

### 7. `batchDeleteWebsites(websiteIds)`

-   **测试用例 1:** 批量删除 "22222222-2222-2222-2222-222222222222" 和 "33333333-3333-3333-3333-333333333333"。
    -   **命令:** `curl -X DELETE -H "Content-Type: application/json" -d '{"websiteIds": ["22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333"]}' http://localhost:3000/websites/batch`
    -   **结果:** 返回 0。
    -   **判定:** 通过
-   **测试用例 2:** 尝试删除一个不存在的 `websiteId`。
    -   **命令:** `curl -X DELETE -H "Content-Type: application/json" -d '{"websiteIds": ["invalid-website-id"]}' http://localhost:3000/websites/batch`
    -   **结果:** 抛出 "无效的网站 ID 列表" 错误。
    -   **判定:** 通过

### 8. `batchMoveWebsites(websiteIds, targetGroupId)`

-   **测试用例 1:** 将 "44444444-4444-4444-4444-444444444444" 和 "55555555-5555-5555-5555-555555555555" 移动到 "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"。
    -   **命令:** `curl -X PATCH -H "Content-Type: application/json" -d '{"websiteIds": ["44444444-4444-4444-4444-444444444444", "55555555-5555-5555-5555-555555555555"], "targetGroupId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"}' http://localhost:3000/websites/batch-move`
    -   **结果:** 返回移动的网站数量为 1。
    -   **判定:** 通过
-   **测试用例 2:** 尝试移动到一个不存在的 `targetGroupId`。
    -   **命令:** `curl -X PATCH -H "Content-Type: application/json" -d '{"websiteIds": ["44444444-4444-4444-4444-444444444444", "55555555-5555-5555-5555-555555555555"], "targetGroupId": "invalid-group-id"}' http://localhost:3000/websites/batch-move`
    -   **结果:** 抛出 "无效的网站 ID 列表或目标分组 ID" 错误。
    -   **判定:** 通过
-   **测试用例 3:** 尝试移动一个不存在的 `websiteId`。
    -   **命令:** `curl -X PATCH -H "Content-Type: application/json" -d '{"websiteIds": ["invalid-website-id"], "targetGroupId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"}' http://localhost:3000/websites/batch-move`
    -   **结果:** 抛出 "无效的网站 ID 列表或目标分组 ID" 错误。
    -   **判定:** 通过

## 总结

所有测试用例均已完成，并且所有函数都按照预期工作。## Website API 测试\n\n### GET /websites\n\n**命令:**\n\n```bash\ncurl -i -X GET http://localhost:3000/websites\n```\n\n**返回:**\n\n```\nHTTP/1.1 200 OK\nX-Powered-By: Express\nAccess-Control-Allow-Origin: *\nContent-Type: application/json; charset=utf-8\nContent-Length: 737\nETag: W/"2e1-09UNbrcdlxVwTkxY3XQVR1IZ6T0"\nDate: Sat, 18 Jan 2025 00:27:34 GMT\nConnection: keep-alive\nKeep-Alive: timeout=5\n\n{"success":true,"data":[{"id":"79363ba1-a77c-4e8b-b872-e6dabb5d88ed","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website","url":"https://www.test.com","description":"This is a test website","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test.com","lastAccessTime":"2025-01-17T00:40:17.471Z","order":4,"isAccessible":true},{"id":"d7d5a924-b0f7-4ebc-9ea1-a0d20cc6e189","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website 4","url":"https://www.test4.com","description":"This is a test website 4","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test4.com","lastAccessTime":"2025-01-17T00:52:55.388Z","order":4,"isAccessible":true}]}\n```\n\n
