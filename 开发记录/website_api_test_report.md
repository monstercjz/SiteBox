## Website API 测试

### GET /websites

**命令:**

```bash
curl -i -X GET http://localhost:3000/websites
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 737
ETag: W/"2e1-09UNbrcdlxVwTkxY3XQVR1IZ6T0"
Date: Sat, 18 Jan 2025 00:27:34 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":[{"id":"79363ba1-a77c-4e8b-b872-e6dabb5d88ed","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website","url":"https://www.test.com","description":"This is a test website","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test.com","lastAccessTime":"2025-01-17T00:40:17.471Z","order":4,"isAccessible":true},{"id":"d7d5a924-b0f7-4ebc-9ea1-a0d20cc6e189","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website 4","url":"https://www.test4.com","description":"This is a test website 4","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test4.com","lastAccessTime":"2025-01-17T00:52:55.388Z","order":4,"isAccessible":true}]}
```

### DELETE /websites/batch

**命令:**

```bash
curl -i -X DELETE -H "Content-Type: application/json" -d "{\"ids\": [\"79363ba1-a77c-4e8b-b872-e6dabb5d88ed\"]}" http://localhost:3000/websites/batch
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 69
ETag: W/"45-8sUY538uVmcQTazMbkXUlksW96A"
Date: Sat, 18 Jan 2025 00:28:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"message":"0 websites deleted successfully"}}
```

### PATCH /websites/batch-move

**命令:**

```bash
curl -i -X PATCH -H "Content-Type: application/json" -d "{\"websiteIds\": [\"d7d5a924-b0f7-4ebc-9ea1-a0d20cc6e189\"], \"targetGroupId\": \"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d\"}" http://localhost:3000/websites/batch-move
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 67
ETag: W/"43-w0ixn2oR5Q8FSjcWTuUA5bbCXuc"
Date: Sat, 18 Jan 2025 00:29:25 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"message":"1 websites moved successfully"}}
```

### GET /websites/groups/:groupId/websites

**命令:**

```bash
curl -i -X GET http://localhost:3000/websites/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 737
ETag: W/"2e1-09UNbrcdlxVwTkxY3XQVR1IZ6T0"
Date: Sat, 18 Jan 2025 00:30:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":[{"id":"79363ba1-a77c-4e8b-b872-e6dabb5d88ed","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website","url":"https://www.test.com","description":"This is a test website","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test.com","lastAccessTime":"2025-01-17T00:40:17.471Z","order":4,"isAccessible":true},{"id":"d7d5a924-b0f7-4ebc-9ea1-a0d20cc6e189","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website 4","url":"https://www.test4.com","description":"This is a test website 4","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test4.com","lastAccessTime":"2025-01-17T00:52:55.388Z","order":4,"isAccessible":true}]}
```

### POST /websites/groups/:groupId/websites

**命令:**

```bash
curl -i -X POST -H "Content-Type: application/json" -d "{\"name\": \"Test Website 5\", \"url\": \"https://www.test5.com\", \"description\": \"This is a test website 5\"}" http://localhost:3000/websites/groups/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/websites
```

**返回:**

```
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 382
ETag: W/"17e-SrWDFFOWCB+k7ycwiPfVjWT3hxI"
Date: Sat, 18 Jan 2025 00:31:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"592b0b99-e2ee-40ea-8b88-929f672009aa","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website 5","url":"https://www.test5.com","description":"This is a test website 5","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test5.com","lastAccessTime":"2025-01-18T00:31:19.204Z","order":3,"isAccessible":true}}
```

### GET /websites/:websiteId

**命令:**

```bash
curl -i -X GET http://localhost:3000/websites/592b0b99-e2ee-40ea-8b88-929f672009aa
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 382
ETag: W/"17e-SrWDFFOWCB+k7ycwiPfVjWT3hxI"
Date: Sat, 18 Jan 2025 00:32:23 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"592b0b99-e2ee-40ea-8b88-929f672009aa","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Test Website 5","url":"https://www.test5.com","description":"This is a test website 5","faviconUrl":"https://www.google.com/s2/favicons?sz=64&domain_url=https%3A%2F%2Fwww.test5.com","lastAccessTime":"2025-01-18T00:31:19.204Z","order":3,"isAccessible":true}}
```

### PUT /websites/:websiteId

**命令:**

```bash
curl -i -X PUT -H "Content-Type: application/json" -d "{\"name\": \"Updated Test Website 5\", \"url\": \"https://www.updatedtest5.com\", \"description\": \"This is an updated test website 5\"}" http://localhost:3000/websites/592b0b99-e2ee-40ea-8b88-929f672009aa
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 311
ETag: W/"137-bJcPbksdmfz6VmoW2OLxHeuCd6A"
Date: Sat, 18 Jan 2025 00:33:37 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"592b0b99-e2ee-40ea-8b88-929f672009aa","groupId":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"Updated Test Website 5","url":"https://www.updatedtest5.com","description":"This is an updated test website 5","lastAccessTime":"2025-01-18T00:31:19.204Z","order":3,"isAccessible":true}}
```

### DELETE /websites/:websiteId

**命令:**

```bash
curl -i -X DELETE http://localhost:3000/websites/592b0b99-e2ee-40ea-8b88-929f672009aa
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 66
ETag: W/"42-DnCKLUz9UR/HLjWkPFSgeP2soIs"
Date: Sat, 18 Jan 2025 00:34:50 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"message":"Website deleted successfully"}}
```

## Group API 测试

### GET /groups

**命令:**

```bash
curl -i -X GET http://localhost:3000/groups
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 393
ETag: W/"189-cDBqjmP1BP2N1vz02cZ94S97fKc"
Date: Sat, 18 Jan 2025 00:36:06 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":[{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"工作","order":1,"isCollapsible":false},{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d","name":"娱乐","order":2,"isCollapsible":false},{"id":"f12a269c-63ed-48e0-9d68-105ea0bd6544","name":"ѧ1","order":4,"isCollapsible":true},{"id":"09b87b6d-2869-4bfe-b8c2-3cd37a5c
ccc20","name":"123","order":5,"isCollapsible":true}]}
```

### POST /groups

**命令:**

```bash
curl -i -X POST -H "Content-Type: application/json" -d "{\"name\": \"Test Group\", \"isCollapsible\": false}" http://localhost:3000/groups
```

**返回:**

```
HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 121
ETag: W/"79-IwR6OXIWJNhFHdsMVEWSyAKsu5E"
Date: Sat, 18 Jan 2025 00:40:57 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659","name":"Test Group","order":6,"isCollapsible":false}}
```

### GET /groups/:groupId

**命令:**

```bash
curl -i -X GET http://localhost:3000/groups/a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 121
ETag: W/"79-IwR6OXIWJNhFHdsMVEWSyAKsu5E"
Date: Sat, 18 Jan 2025 00:42:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659","name":"Test Group","order":6,"isCollapsible":false}}
```

### PUT /groups/:groupId

**命令:**

```bash
curl -i -X PUT -H "Content-Type: application/json" -d "{\"name\": \"Updated Test Group\", \"isCollapsible\": true}" http://localhost:3000/groups/a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 128
ETag: W/"80-SecBqcCDfKZmuaLm4IamGJQkiPU"
Date: Sat, 18 Jan 2025 00:44:09 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"id":"a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659","name":"Updated Test Group","order":6,"isCollapsible":true}}
```

### DELETE /groups/:groupId

**命令:**

```bash
curl -i -X DELETE http://localhost:3000/groups/a9f9d2a2-e2cb-40a5-b0a8-f578e8f20659
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 64
ETag: W/"40-+6X4luoG9eWW/sAyUtS9QFm/+n0"
Date: Sat, 18 Jan 2025 00:45:49 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":{"message":"Group deleted successfully"}}
```

### PATCH /groups/reorder

**命令:**

```bash
curl -i -X PATCH -H "Content-Type: application/json" -d "[{\"id\": \"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d\", \"order\": 2}, {\"id\": \"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d\", \"order\": 1}]" http://localhost:3000/groups/reorder
```

**返回:**

```
HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 213
ETag: W/"d5-Nzp9mEt5GjoaqCvU8HXneva4Mqw"
Date: Sat, 18 Jan 2025 00:47:34 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":true,"data":[{"id":"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d","name":"工作","order":2,"isCollapsible":false},{"id":"a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d","name":"娱乐","order":1,"isCollapsible":false}]}