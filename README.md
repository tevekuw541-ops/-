# 黑板猫校园外卖兼职招聘系统

一个可本地运行的校园外卖兼职招聘 MVP，包含学生手机端报名、课表图片上传、SQLite 数据存储、后台登录、报名筛选、手动标记空闲节次、CSV 导出和基础可视化。

## 功能

- 学生报名页：姓名、手机号、微信号、年级、性别、备注、课表图片上传与预览。
- 年级自动生成：默认 3 年制，例如 2026 年显示 2024 级、2025 级、2026 级。
- 后台登录：默认账号 `admin`，默认密码 `admin123`，上线前请改环境变量。
- 后台看板：总报名人数、今日新增、年级柱状图、性别饼图、空闲节次柱状图、每日新增折线图。
- 报名列表：支持姓名/手机号/微信搜索，按年级、性别、状态、报名时间、空闲节次筛选。
- 课表详情：后台查看学生上传的课表原图，手动勾选周一到周日、1-2 到 9-10 节的空闲时间。
- 数据导出：导出当前筛选结果为 CSV。
- 本地存储：数据库在 `data/blackboard-cat.sqlite`，图片在 `public/uploads`。

## 本地运行

1. 安装依赖

```bash
npm install
```

Windows PowerShell 如果提示 npm 脚本被禁用，可以使用：

```bash
npm.cmd install
```

2. 配置环境变量

复制 `.env.example` 为 `.env.local`，按需修改：

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_SESSION_SECRET=change-this-before-deploy
SCHOOL_DURATION_YEARS=3
```

3. 启动开发环境

```bash
npm run dev
```

PowerShell 可用：

```bash
npm.cmd run dev
```

访问：

- 学生报名端：http://localhost:3000
- 后台管理端：http://localhost:3000/admin

## 构建部署

```bash
npm run build
npm run start
```

部署到正式服务器时，请设置正式的 `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`，并持久化 `data` 和 `public/uploads` 目录。后续如果迁移到 Supabase 或 PostgreSQL，只需要替换 `src/lib/db.ts` 的数据访问层。

阿里云 ECS 部署请看 [DEPLOY_ALIYUN.md](./DEPLOY_ALIYUN.md)。

## OCR 说明

当前版本保留了 OCR 模块接口，上传后会保存基础占位识别结果。因为学生课表图片格式差异很大，后台已提供手动标记空闲节次功能，保证筛选可用。后续可以在 `src/lib/ocr.ts` 中接入 PaddleOCR、Tesseract 或云 OCR 服务。
