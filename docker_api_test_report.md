# Docker API 接口测试报告

## POST /api/docker-groups/{groupId}/dockers - 创建 Docker 记录

### 1. 请求 (JSON 格式错误)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d '{"dockerData": {"name": "test-docker", "url": "http://localhost", "urlPort": 8080, "description": "测试 Docker 记录", "server": "localhost", "serverPort": 2375"}}' http://localhost:3000/api/docker-groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>SyntaxError: Expected &#39;&#39; or &#39;}&#39; after property value in JSON at position 158 (line 1 column 159)<br> &nbsp; &nbsp;at JSON.parse (<anonymous>)<br> &nbsp; &nbsp;at parse (D:\personal-nav2\backend\node_modules\body-parser\lib\types\json.js:92:19)<br> &nbs
sp; &nbsp;at D:\personal-nav2\backend\node_modules\body-parser\lib\read.js:128:18<br> &nbsp; &nbsp;at AsyncResource.runInAsyncScope (node:async_hooks:211:14)<br> &nbsp; &nbsp;at invokeCallback (D:\personal-nav2\backend\node_modules\raw-body\index.js:238:16)<br> &nbsp; &nbsp;at don
ne (D:\personal-nav2\backend\node_modules\raw-body\index.js:227:7)<br> &nbsp; &nbsp;at IncomingMessage.onEnd (D:\personal-nav2\backend\node_modules\raw-body\index.js:287:7)<br> &nbsp; &nbsp;at IncomingMessage.emit (node:events:524:28)<br> &nbsp; &nbsp;at endReadableNT (node:intern
nal/streams/readable:1698:12)<br> &nbsp; &nbsp;at process.processTicksAndRejections (node:internal/process/task_queues:90:21)</pre>
</body>
</html>
\`\`\`

### 2. 请求 (修正 JSON, URL 前缀错误)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d "{\"dockerData\": {\"name\": \"test-docker\", \"url\": \"http://localhost\", \"urlPort\": 8080, \"description\": \"测试 Docker 记录\", \"server\": \"localhost\", \"serverPort\": 2375}}" http://localhost:3000/api/docker-groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/docker-groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers</pre>
</body>
</html>
\`\`\`

### 3. 请求 (修正 URL 前缀, groupId 在 body 中)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d "{\"dockerData\": {\"name\": \"test-docker\", \"url\": \"http://localhost\", \"urlPort\": 8080, \"description\": \"测试 Docker 记录\", \"server\": \"localhost\", \"serverPort\": 2375}}" http://localhost:3000/api/dockers/groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`json
{"success":false"error":"创建 Docker 记录失败: \"groupId\" is required"}
\`\`\`

### 4. 请求 (修正 URL 前缀, groupId 在 params 中, 代码修复前)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d "{\"dockerData\": {\"name\": \"test-docker\", \"url\": \"http://localhost\", \"urlPort\": 8080, \"description\": \"测试 Docker 记录\", \"server\": \"localhost\", \"serverPort\": 2375}}" http://localhost:3000/api/dockers/groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`json
{"success":false"error":"创建 Docker 记录失败: \"groupId\" is required"}
\`\`\`

### 5. 请求 (修正 URL 前缀, groupId 在 params 中, 代码修复后)
\`\`\`bash
curl -X POST -H "Content-Type: application/json" -d "{\"dockerData\": {\"name\": \"test-docker\", \"url\": \"http://localhost\", \"urlPort\": 8080, \"description\": \"测试 Docker 记录\", \"server\": \"localhost\", \"serverPort\": 2375}}" http://localhost:3000/api/dockers/groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":{"id":"a17ef569-a106-490f-823e-f6095f9eb365""groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad""name":"test-docker""url":"http://localhost""urlPort":8080"description":"���� Docker ��¼""server":"localhost""serverPort":2375"faviconUrl":"/data/icons/Docker.png.ico""createdAt":"2025-02-12T22:16:39.944Z""updatedAt":"2025-02-12T22:16:39.944Z"}}
\`\`\`

## GET /api/dockers - 获取所有 Docker 记录

### 6. 请求
\`\`\`bash
curl http://localhost:3000/api/dockers
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":[{"id":"a17ef569-a106-490f-823e-f6095f9eb365""groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad""name":"test-docker""url":"http://localhost""urlPort":8080"description":"���� Docker ��¼""server":"localhost""serverPort":2375"faviconUrl":"/data/icons/Docker.png.ico""createdAt":"2025-02-12T22:16:39.944Z""updatedAt":"2025-02-12T22:16:39.944Z"}]}
\`\`\`

## GET /api/dockers/groups/{groupId}/dockers - 获取分组 Docker 记录

### 7. 请求 (URL 前缀错误)
\`\`\`bash
curl http://localhost:3000/api/docker-groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /api/docker-groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers</pre>
</body>
</html>
\`\`\`

### 8. 请求 (修正 URL 前缀)
\`\`\`bash
curl http://localhost:3000/api/dockers/groups/a9962f72-4460-4504-b1b9-c50b5e050aad/dockers
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":[{"id":"a17ef569-a106-490f-823e-f6095f9eb365""groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad""name":"test-docker""url":"http://localhost""urlPort":8080"description":"���� Docker ��¼""server":"localhost""serverPort":2375"faviconUrl":"/data/icons/Dock
ker.png.ico""createdAt":"2025-02-12T22:16:39.944Z""updatedAt":"2025-02-12T22:16:39.944Z"}]}
\`\`\`

## GET /api/dockers/{dockerId} - 获取单个 Docker 记录

### 9. 请求
\`\`\`bash
curl http://localhost:3000/api/dockers/a17ef569-a106-490f-823e-f6095f9eb365
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":{"id":"a17ef569-a106-490f-823e-f6095f9eb365""groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad""name":"test-docker""url":"http://localhost""urlPort":8080"description":"���� Docker ��¼""server":"localhost""serverPort":2375"faviconUrl":"/data/icons/Docke
er.png.ico""createdAt":"2025-02-12T22:16:39.944Z""updatedAt":"2025-02-12T22:16:39.944Z"}}
\`\`\`

## PUT /api/dockers/{dockerId} - 更新 Docker 记录

### 10. 请求
\`\`\`bash
curl -X PUT -H "Content-Type: application/json" -d "{\"dockerData\": {\"name\": \"test-docker\", \"url\": \"http://localhost\", \"urlPort\": 8080, \"description\": \"更新后的测试 Docker 记录\", \"server\": \"localhost\", \"serverPort\": 2375}}" http://localhost:3000/api/dockers/a17ef569-a106-490f-823e-f6095f9eb365
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":{"id":"a17ef569-a106-490f-823e-f6095f9eb365""groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad""name":"test-docker""url":"http://localhost""urlPort":8080"description":"���º�Ĳ��� Docker ��¼""server":"localhost""serverPort":2375"faviconUrl":"/data/icons/
/Docker.png.ico""createdAt":"2025-02-12T22:16:39.944Z""updatedAt":"2025-02-12T22:17:19.032Z"}}
\`\`\`

## DELETE /api/dockers/{dockerId} - 删除 Docker 记录

### 11. 请求
\`\`\`bash
curl -X DELETE http://localhost:3000/api/dockers/a17ef569-a106-490f-823e-f6095f9eb365
\`\`\`

**响应结果:**
\`\`\`json
{"success":true"data":{"deleted":1"message":"Docker 记录已删除"}}
\`\`\`

## GET /api/dockers/realdockerinfo - 获取所有 Docker 容器实时信息

### 12. 请求 (URL 前缀错误)
\`\`\`bash
curl http://localhost:3000/api/realdockerinfo
\`\`\`

**响应结果:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /api/realdockerinfo</pre>
</body>
</html>
\`\`\`

### 13. 请求 (修正 URL 前缀)
\`\`\`bash
curl http://localhost:3000/api/dockers/realdockerinfo
\`\`\`

**响应结果:**
\`\`\`json
success":false"error":"Docker "
\`\`\`

## GET /api/dockers/realdockerinfo/{dockerId} - 获取单个 Docker 容器实时信息

### 14. 请求
\`\`\`bash
curl http://localhost:3000/api/dockers/realdockerinfo/non-existent-docker-id
\`\`\`

**响应结果:**
\`\`\`json
{"success":false"error":"(HTTP code 404) no such container - No such container: non-existent-docker-id "}
\`\`\`