```
方案：使用 Nginx 部署前端静态文件

Nginx 是一个高性能的 Web 服务器，非常适合用于 serving 静态文件，例如 HTML、CSS、JavaScript 和图片等。 这种方案的优点是配置简单、性能高、资源消耗少，非常适合前端项目的 Docker 部署。

步骤：

在 frontend 目录下创建 Dockerfile (frontend/Dockerfile)

在您的 frontend 目录下创建一个名为 Dockerfile 的文件，并复制粘贴以下内容：

FROM nginx:alpine

# 将前端项目的所有文件复制到 Nginx 默认的 HTML 目录下
COPY frontend/ /usr/share/nginx/html/

# 暴露 80 端口，Nginx 默认监听 80 端口
EXPOSE 80

# 启动 Nginx (默认配置，无需额外配置)
CMD ["nginx", "-g", "daemon off;"]
Dockerfile 内容解释：

FROM nginx:alpine: 使用官方的 Nginx Alpine 镜像作为基础镜像。Alpine 镜像体积小巧，非常适合 Docker 部署。
COPY frontend/ /usr/share/nginx/html/: 将宿主机 frontend/ 目录下的所有文件和文件夹复制到 Docker 容器内的 /usr/share/nginx/html/ 目录。/usr/share/nginx/html/ 是 Nginx 默认的静态文件根目录。
EXPOSE 80: 声明容器对外暴露 80 端口。
CMD ["nginx", "-g", "daemon off;"]: 容器启动后，执行 nginx -g "daemon off;" 命令来启动 Nginx Web 服务器。-g "daemon off;" 参数是为了让 Nginx 在前台运行，保持容器运行状态。
构建前端 Docker 镜像

打开终端，切换到您的项目根目录 (例如 /root/personal-nav)。 执行以下命令来构建前端 Docker 镜像：

docker build -t personal-nav-frontend:latest -f frontend/Dockerfile .
docker build: Docker 构建命令。
-t personal-nav-frontend:latest: 为构建的镜像添加 tag，命名为 personal-nav-frontend，tag 为 latest。
-f frontend/Dockerfile: 指定 Dockerfile 的路径为 frontend/Dockerfile。
.: 最后的 . 表示使用当前目录 (项目根目录 /root/personal-nav) 作为 Docker 构建上下文。
运行前端 Docker 容器

镜像构建成功后，执行以下命令来运行前端 Docker 容器：

docker run -d -p 8080:80 personal-nav-frontend:latest
docker run: Docker 运行命令。
-d: 在后台运行容器。
-p 8080:80: 将宿主机的 8080 端口映射到容器的 80 端口。 您可以根据需要修改宿主机端口 (例如改为 80)，但需要确保宿主机 80 端口没有被占用。
personal-nav-frontend:latest: 指定要运行的镜像名称和 tag。
访问您的前端应用

容器运行成功后，您可以通过浏览器访问 http://localhost:8080 (或者 http://<您的服务器IP>:8080 如果您将 Docker 部署在远程服务器上) 来访问您的前端应用。
```