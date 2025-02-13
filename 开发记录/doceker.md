## 增加页面显示局域网内docker容器信息
### 核心需求
1. 获取Docker容器信息
2. 页面显示docker容器信息
3. docker容器信息的获取可以考虑使用暴露dockerapi
### 步骤
#### 了解当前项目
1. 先了解前端和后端对于网站和分组的代码，明白了前后端对于分组和网站信息的处理逻辑和方式
2. 其实docker容器信息只是一个特别的网站信息，所以处理前后端交互的逻辑应该大致相同，只是页面所展示的docker容器信息与website不一样，website存储和页面展示的信息都是用户提交的信息，但是docker存储的信息是用户提交的信息，但是页面展示的信息却是后端根据用户提交的信息去获取docker对于的实时信息
#### 前端
1. 在前端html的action-buttons里添加一个按钮,点击按钮，弹出modal页面，可以添加某个docker容器的相关信息
2. 在前端script.js中添加一个事件响应，处理新添加按钮的点击事件
3. 当前前端项目modules,添加一个dockerInteractionService.js用来处理新添加按钮的点击事件
4. dockerInteractionService.js起到承上启下的作用，除了响应按钮点击事件，还应该具有添加容器，修改容器，删除容器，三个功能,功能的实现可以是调用dockerOperationService.js获取用户数据，然后调用dockerDataService.js去处理数据
5. 创建dockerDataSservice.js，用来调用前端api.js，专门处理与后端的交互
6. 创建dockerOperationService.js，用来处理添加，修改，删除容器，三个功能,本页面代码功能负责创建modal页面与用户交互，并且获取用户操作的数据，然后将数据返回给dockerIteractionService.js
7. 根据后端新建立的api，将新的端口的调用封装补充到api.js
#### 后端
1. dockerService.js应该可以获取docker容器信息，添加docker容器，修改docker容器，删除docker容器
2. docker信息存储在后端/data/docker-data.json中,数据结构参考site-data.json
3. docker分组的组信息，可以沿用已经存在的groupService.js，但是有一个明显的问题，虽然对于分组的各种逻辑是一致的，但是后台存储数据的文件却是不一样的，需要如何处理呢?
### 其他要求
1. 请勿改变当前其他功能模块的代码，当前项目各项功能均正常
2. 新增代码，应该也具有完整的标准注释
## apitest
```bash
$ curl -X POST -H "Content-Type: application/json" -d '{
>   "groupId": "a9962f72-4460-4504-b1b9-c50b5e050aad",
>   "dockerData": {
>     "name": "test-docker",
>     "url": "http://test-docker.com",
>     "urlPort": 8080,
>     "description": "测试 Docker 记录",
>     "server": "192.168.3.245",
>     "serverPort": 2375
>   }
> }' http://localhost:3000/api/docker/docker
{"success":true,"data":{"id":"c8f2f355-2724-4bd5-bf13-7c65b20082b8","groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad","name":"test-docker","url":"http://test-docker.com","urlPort":8080,"description":"���� Docker ��¼","server":"192.168.3.245","serverPort":2375,"faviconUrl":"/data/icons/Docker.png.ico","createdAt":"2025-02-12T19:51:37.022Z","updatedAt":"2025-02-12T19:51:37.022Z"}}
```
```bash
$ curl -X PUT -H "Content-Type: application/json" -d '{
>   "dockerData": {
>     "name": "updated-docker-name",
>     "url": "http://updated-docker.com",
>     "urlPort": 8081,
>     "description": "更新后的 Docker 记录描述",
>     "server": "192.168.3.245",
>     "serverPort": 2375
>   }
> }' http://localhost:3000/api/docker/docker/c8f2f355-2724-4bd5-bf13-7c65b20082b8
{"success":true,"data":{"id":"c8f2f355-2724-4bd5-bf13-7c65b20082b8","groupId":"a9962f72-4460-4504-b1b9-c50b5e050aad","name":"updated-docker-name","url":"http://updated-docker.com","urlPort":8081,"description":"���º�� Docker ��¼����","server":"192.168.3.245","serverPort":2375,"faviconUrl":"/data/icons/Docker.png.ico","createdAt":"2025-02-12T19:51:37.022Z","updatedAt":"2025-02-12T19:53:51.333Z"}}
```
```bash
$ curl -X DELETE http://localhost:3000/api/docker/docker/c8f2f355-2724-4bd5-bf13-7c65b20082b8
{"success":true,"data":{"deleted":1,"message":"Docker 记录已删除"}}
```

