# API 测试报告

## Group API

### 获取所有分组 (GET /groups)

**请求命令:**

```bash
curl -X GET http://localhost:3000/groups
```

**返回 Body:**

```json
{"success":true"data":[{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d""name":"工作""order":2"isCollapsible":false}{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d""name":"娱乐""order":1"isCollapsible":false}]}
```

### 创建新的分组 (POST /groups)

**请求命令:**

```bash
curl -X POST http://localhost:3000/groups -H "Content-Type: application/json" -d "{\"name\": \"测试分组\", \"order\": 3, \"isCollapsible\": true}"
```

**返回 Body:**

```json
{"success":false"error":"\"order\" is not allowed"}
```

**请求命令:**

```bash
curl -X POST http://localhost:3000/groups -H "Content-Type: application/json" -d "{\"name\": \"测试分组\", \"isCollapsible\": true}"
```

**返回 Body:**

```json
{"success":true"data":{"id":"9b5d6347-8545-4f20-8aac-3e781009061c""name":"���Է���""order":7"isCollapsible":true}}
```

### 获取单个分组详情 (GET /groups/:groupId)

**请求命令:**

```bash
curl -X GET http://localhost:3000/groups/9b5d6347-8545-4f20-8aac-3e781009061c
```

**返回 Body:**

```json
{"success":true"data":{"id":"9b5d6347-8545-4f20-8aac-3e781009061c""name":"���Է���""order":7"isCollapsible":true}}
```

### 更新分组信息 (PUT /groups/:groupId)

**请求命令:**

```bash
curl -X PUT http://localhost:3000/groups/9b5d6347-8545-4f20-8aac-3e781009061c -H "Content-Type: application/json" -d "{\"name\": \"更新后的测试分组\", \"isCollapsible\": false}"
```

**返回 Body:**

```json
{"success":true"data":{"id":"9b5d6347-8545-4f20-8aac-3e781009061c""name":"���º�Ĳ��Է���""order":7"isCollapsible":false}}
```

### 删除分组 (DELETE /groups/:groupId)

**请求命令:**

```bash
curl -X DELETE http://localhost:3000/groups/9b5d6347-8545-4f20-8aac-3e781009061c
```

**返回 Body:**

```json
{"success":true"data":{"message":"Group deleted successfully"}}
```

### 分组排序 (PATCH /groups/reorder)

**请求命令:**

```bash
curl -X PATCH http://localhost:3000/groups/reorder -H "Content-Type: application/json" -d "[{\"id\":\"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d\",\"order\":1},{\"id\":\"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d\",\"order\":2}]"
```

**返回 Body:**

```json
{"success":true"data":[{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d""name":"工作""order":1"isCollapsible":false}{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d""name":"娱乐""order":2"isCollapsible":false}]}
```

## Website API

### 获取所有网站记录 (GET /websites)

**请求命令:**

```bash
curl -X GET http://localhost:3000/websites
```

**返回 Body:**

```json
{"success":true"data":[]}
```

### 批量删除网站记录 (DELETE /websites/batch)

**请求命令:**

```bash
curl -X DELETE http://localhost:3000/websites/batch -H "Content-Type: application/json" -d "{\"websiteIds\": [\"websiteId1\", \"websiteId2\"]}"
```

**返回 Body:**

```json
{"success":true"data":{"message":"2 websites deleted successfully"}}
```

### 批量移动网站记录到其他分组 (PATCH /websites/batch-move)

**请求命令:**

```bash
curl -X PATCH http://localhost:3000/websites/batch-move -H "Content-Type: application/json" -d "{\"websiteIds\": [\"d7d5a924-b0f7-4ebc-9ea1-a0d20cc6e189\"], \"targetGroupId\": \"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d\"}"
```

**返回 Body:**

```json
{"success":true"data":{"message":"0 websites moved successfully"}}
```

### 获取某个分组下的所有网站记录 (GET /groups/:groupId/websites)

**请求命令:**

```bash
curl -X GET http://localhost:3000/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites
```

**返回 Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites</pre>
</body>
</html>
```

### 在某个分组下创建新的网站记录 (POST /groups/:groupId/websites)

**请求命令:**

```bash
curl -X POST http://localhost:3000/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites -H "Content-Type: application/json" -d "{\"url\": \"https://www.example.com\", \"name\": \"示例网站\", \"faviconUrl\": \"https://www.example.com/favicon.ico\"}"
```

**返回 Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites</pre>
</body>
</html>
```

**请求命令:**

```bash
curl -X POST http://localhost:3000/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites -H "Content-Type: application/json" -d "{\"url\": \"https://www.example.com\", \"name\": \"示例网站\"}"
```

**返回 Body:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites</pre>
</body>
</html>
```

### 获取单个网站记录详情 (GET /websites/:websiteId)

**请求命令:**

```bash
curl -X GET http://localhost:3000/websites/websiteId
```

**返回 Body:**

```json
{"success":false"error":"Website not found"}
```

### 更新网站记录信息 (PUT /websites/:websiteId)

**请求命令:**

```bash
curl -X PUT http://localhost:3000/websites/websiteId -H "Content-Type: application/json" -d "{\"url\": \"https://www.example.com\", \"name\": \"示例网站\", \"faviconUrl\": \"https://www.example.com/favicon.ico\"}"
```

**返回 Body:**

```json
{"success":false"error":"Website not found"}
```

### 删除网站记录 (DELETE /websites/:websiteId)

**请求命令:**

```bash
curl -X DELETE http://localhost:3000/websites/websiteId
```

**返回 Body:**

```json
{"success":false"error":"Website not found"}
```

# 总结

## 共同规律

-   所有 API 的返回结果都是 JSON 格式。
-   所有 API 的返回结果都包含 `success` 字段，表示请求是否成功。
-   如果 `success` 为 `true`，则返回结果中通常会包含 `data` 字段，其中包含具体的数据。
-   如果 `success` 为 `false`，则返回结果中通常会包含 `error` 字段，其中包含错误信息。

## Group API

-   `GET /groups` 返回所有分组的数组。
-   `POST /groups` 创建新的分组，返回新分组的信息。
-   `GET /groups/:groupId` 返回指定分组的信息。
-   `PUT /groups/:groupId` 更新指定分组的信息，返回更新后的分组信息。
-   `DELETE /groups/:groupId` 删除指定分组，返回成功信息。
-   `PATCH /groups/reorder` 更新分组的排序，返回更新后的分组数组。

## Website API

-   `GET /websites` 返回所有网站记录的数组。
-   `DELETE /websites/batch` 批量删除网站记录，返回成功信息。
-   `PATCH /websites/batch-move` 批量移动网站记录到其他分组，返回成功信息。
-   `GET /groups/:groupId/websites` 获取某个分组下的所有网站记录，目前无法测试，返回错误信息。
-   `POST /groups/:groupId/websites` 在某个分组下创建新的网站记录，目前无法测试，返回错误信息。
-   `GET /websites/:websiteId` 获取单个网站记录详情，目前无法测试，返回 "Website not found" 错误信息。
-   `PUT /websites/:websiteId` 更新网站记录信息，目前无法测试，返回 "Website not found" 错误信息。
-   `DELETE /websites/:websiteId` 删除网站记录，目前无法测试，返回 "Website not found" 错误信息。