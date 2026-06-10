# 阿里云 ECS 部署步骤

推荐部署方式：阿里云 ECS + Docker Compose + Nginx 反向代理。这个项目会保存课表图片和 SQLite 数据，所以需要一台有持久磁盘的服务器。

## 1. 准备 ECS

建议配置：

- 系统：Ubuntu 22.04 / 24.04
- 规格：2 核 2G 起步
- 磁盘：40G 起步
- 安全组开放：`22`、`80`、`443`

如果暂时没有域名，也可以先开放 `3000` 测试访问，但正式使用建议只开放 `80/443`。

## 2. 安装 Docker

登录服务器：

```bash
ssh root@你的服务器公网IP
```

安装 Docker 和 Compose：

```bash
apt update
apt install -y ca-certificates curl git nginx
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 3. 上传项目

在服务器创建目录：

```bash
mkdir -p /opt/blackboard-cat
```

把本项目上传到 `/opt/blackboard-cat`。如果你用 Git，可以在服务器上拉代码；如果不用 Git，可以在本机压缩后上传。

进入项目目录：

```bash
cd /opt/blackboard-cat
```

## 4. 配置生产环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

务必修改：

```bash
ADMIN_USERNAME=你的后台账号
ADMIN_PASSWORD=你的后台强密码
ADMIN_SESSION_SECRET=一串至少32位随机字符串
SCHOOL_DURATION_YEARS=3
```

可以生成随机密钥：

```bash
openssl rand -hex 32
```

## 5. 启动项目

```bash
docker compose up -d --build
```

查看状态：

```bash
docker compose ps
docker compose logs -f
```

此时服务在服务器本机 `3000` 端口运行。

## 6. 配置 Nginx

把 `your-domain.com` 换成你的域名：

```bash
cat > /etc/nginx/sites-available/blackboard-cat <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf /etc/nginx/sites-available/blackboard-cat /etc/nginx/sites-enabled/blackboard-cat
nginx -t
systemctl reload nginx
```

访问：

- 学生报名端：`http://your-domain.com`
- 后台管理端：`http://your-domain.com/admin`

## 7. 配置 HTTPS

域名解析到服务器后，安装证书工具：

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

按提示完成后，访问地址会变成：

```text
https://your-domain.com
```

## 8. 数据和图片保存位置

Docker Compose 已经挂载了持久化目录：

- 数据库：`/opt/blackboard-cat/data/blackboard-cat.sqlite`
- 课表图片：`/opt/blackboard-cat/public/uploads`

备份命令示例：

```bash
tar -czf blackboard-cat-backup-$(date +%F).tar.gz data public/uploads .env.production
```

## 9. 更新项目

上传新代码后：

```bash
cd /opt/blackboard-cat
docker compose up -d --build
```

## 我直接帮你部署需要的信息

如果要我直接部署，请提供：

- ECS 公网 IP
- SSH 用户名
- SSH 密码或私钥
- 域名，如果已经有
- 是否已经把域名解析到 ECS

拿到这些后，我可以直接把项目传到服务器、启动服务并配好 Nginx。
