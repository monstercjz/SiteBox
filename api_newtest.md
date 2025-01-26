# API 测试报告

本报告记录了对后端 API 端点的测试结果。

## API 端点列表

### /groups

**请求命令:**

```bash
curl http://localhost:3000/groups
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":[{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d","name":"娱乐","order":1,"isCollapsible":false},{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"工作","order":2,"isCollapsible":false}]}
```

**请求命令:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "测试分组", "isCollapsible": false}' http://localhost:3000/groups
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"684b2b31-c45a-4365-b198-03ac7f4e44d9","name":"测试分组","order":9,"isCollapsible":false}}
```

**请求命令:**

```bash
curl http://localhost:3000/groups/684b2b31-c45a-4365-b198-03ac7f4e44d9
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"684b2b31-c45a-4365-b198-03ac7f4e44d9","name":"测试分组","order":9,"isCollapsible":false}}
```

**请求命令:**

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"name": "更新后的测试分组", "isCollapsible": true}' http://localhost:3000/groups/684b2b31-c45a-4365-b198-03ac7f4e44d9
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"684b2b31-c45a-4365-b198-03ac7f4e44d9","name":"更新后的测试分组","order":9,"isCollapsible":true}}
```

**请求命令:**

```bash
curl -X DELETE http://localhost:3000/groups/684b2b31-c45a-4365-b198-03ac7f4e44d9
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"message":"Group deleted successfully"}}
```

**请求命令:**

```bash
curl -X PATCH -H "Content-Type: application/json" -d '[{"id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", "order": 2}, {"id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "order": 1}]' http://localhost:3000/groups/reorder
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":[{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d","name":"娱乐","order":2,"isCollapsible":false},{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"工作","order":1,"isCollapsible":false}]}
```

### /websites

**请求命令:**

```bash
curl http://localhost:3000/websites
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":[]}
```

**请求命令:**

```bash
curl -X DELETE -H "Content-Type: application/json" -d '{"websiteIds": []}' http://localhost:3000/websites/batch
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"message":"0 websites deleted successfully"}}
```

**请求命令:**

```bash
curl -X PATCH -H "Content-Type: application/json" -d '{"websiteIds": [], "groupId": "test-group-id"}' http://localhost:3000/websites/batch-move
```

**返回状态码:**

400

**返回主体:**

```json
{"success":false,"error":"无效的网站 ID 列表或目标分组 ID: \"websiteIds\" does not contain 1 required value(s)"}
```

**请求命令:**

```bash
curl http://localhost:3000/websites/groups/56728086-1411-4d93-91b4-80cf64b403f4/websites
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":[]}
```

**请求命令:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://www.example.com", "name": "示例网站"}' http://localhost:3000/websites/groups/56728086-1411-4d93-91b4-80cf64b403f4/websites
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"73dc7868-fe04-4946-9918-aa15ecb2ffdc","groupId":"56728086-1411-4d93-91b4-80cf64b403f4","name":"示例网站","url":"https://www.example.com","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=\n=https%3A%2F%2Fwww.example.com","lastAccessTime":"2025-01-18T10:28:26.896Z","order":1,"isAccessible":true}}
```

**请求命令:**

```bash
curl http://localhost:3000/websites/73dc7868-fe04-4946-9918-aa15ecb2ffdc
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"73dc7868-fe04-4946-9918-aa15ecb2ffdc","groupId":"56728086-1411-4d93-91b4-80cf64b403f4","name":"示例网站","url":"https://www.example.com","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=\n=https%3A%2F%2Fwww.example.com","lastAccessTime":"2025-01-18T10:28:26.896Z","order":1,"isAccessible":true}}
```

**请求命令:**

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"name": "更新后的示例网站", "url": "https://www.example.com"}' http://localhost:3000/websites/73dc7868-fe04-4946-9918-aa15ecb2ffdc
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"id":"73dc7868-fe04-4946-9918-aa15ecb2ffdc","groupId":"56728086-1411-4d93-91b4-80cf64b403f4","name":"更新后的示例网站","url":"https://www.example.com","lastAccessTime":"2025-01-18T10:28:26.896Z","order":1,"isAccessible":true}}
```

**请求命令:**

```bash
curl -X DELETE http://localhost:3000/websites/73dc7868-fe04-4946-9918-aa15ecb2ffdc
```

**返回状态码:**

200

**返回主体:**

```json
{"success":true,"data":{"message":"Website deleted successfully"}}