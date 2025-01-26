# API 测试报告

本报告记录了对后端 API 端点的测试结果。

## analyticsRoutes.js

### `GET /analytics`

**说明**: 获取网站记录的访问统计信息

**请求**:

```bash
curl -X GET http://localhost:3000/analytics
```

**响应**:

```json
{
  "success": true,
  "data": {
    "groups": [],
    "websites": []
  }
}
```

## groupRoutes.js

### `GET /groups`

**说明**: 获取所有分组

**请求**:

```bash
curl -X GET http://localhost:3000/groups
```

**响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "工作",
      "order": 1,
      "isCollapsible": false
    },
    {
      "id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "娱乐",
      "order": 2,
      "isCollapsible": false
    }
  ]
}
```

### `POST /groups`

**说明**: 创建新的分组

**请求**:

```bash
curl -X POST http://localhost:3000/groups -H "Content-Type: application/json" -d '{"name": "Test Group", "isCollapsible": false}'
```

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "02356699-3b71-49ab-b9d9-86e8b32cc99d",
    "name": "Test Group",
    "order": 8,
    "isCollapsible": false
  }
}
```

### `GET /groups/:groupId`

**说明**: 获取单个分组详情

**请求**:

```bash
curl -X GET http://localhost:3000/groups/02356699-3b71-49ab-b9d9-86e8b32cc99d
```

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "02356699-3b71-49ab-b9d9-86e8b32cc99d",
    "name": "Test Group",
    "order": 8,
    "isCollapsible": false
  }
}
```

### `PUT /groups/:groupId`

**说明**: 更新分组信息

**请求**:

```bash
curl -X PUT http://localhost:3000/groups/02356699-3b71-49ab-b9d9-86e8b32cc99d -H "Content-Type: application/json" -d '{"name": "Updated Test Group", "isCollapsible": false}'
```

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "02356699-3b71-49ab-b9d9-86e8b32cc99d",
    "name": "Updated Test Group",
    "order": 8,
    "isCollapsible": false
  }
}
```

### `DELETE /groups/:groupId`

**说明**: 删除分组

**请求**:

```bash
curl -X DELETE http://localhost:3000/groups/02356699-3b71-49ab-b9d9-86e8b32cc99d
```

**响应**:

```json
{
  "success": true,
  "data": {
    "message": "Group deleted successfully"
  }
}
```

### `PATCH /groups/reorder`

**说明**: 分组排序

**请求**:

```bash
curl -X PATCH http://localhost:3000/groups/reorder -H "Content-Type: application/json" -d '[{"id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d", "order": 1}, {"id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "order": 2}]'
```

**响应**:

```json
## miscRoutes.js

### `GET /status`

**说明**: 获取系统状态

**请求**:

```bash
curl -X GET http://localhost:3000/status
```

**响应**:

```json
<pre>
Cannot GET /status
</pre>
```

### `GET /help`

**说明**: 获取帮助文档

**请求**:

```bash
curl -X GET http://localhost:3000/help
```

**响应**:

```json
<pre>
Cannot GET /help
## pluginRoutes.js

### `GET /extension/data`

**说明**: 获取浏览器扩展数据

**请求**:

```bash
curl -X GET http://localhost:3000/extension/data
```

**响应**:

```json
<pre>
Cannot GET /extension/data
</pre>
```

### `POST /extension/sync`

**说明**: 同步浏览器书签

**请求**:

```bash
curl -X POST http://localhost:3000/extension/sync
```

**响应**:

```json
待测试
```
</pre>
```
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "娱乐",
      "order": 1,
      "isCollapsible": false
    },
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "工作",
      "order": 2,
      "isCollapsible": false
    }
  ]
}