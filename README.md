# VOID LOG — 虚空日志

一个简洁优雅的个人博客系统，基于 Next.js 15 + SQLite 构建，支持文章管理、评论审核、多用户管理和深色主题。

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

- 📝 **文章管理** — 创建、编辑、发布文章，支持 Markdown 编辑器
- 💬 **评论系统** — 访客评论 + 管理员审核
- 🎨 **深色主题** — 自动跟随系统主题
- 🔐 **管理员后台** — 仪表盘、文章管理、评论审核、站点设置
- 👥 **多用户管理** — 添加/编辑/删除账户，修改密码（设置页面）
- 📱 **响应式设计** — 适配桌面端和移动端
- 🌐 **RSS 订阅** — 自动生成 RSS Feed (`/rss.xml`)
- 📋 **站点地图** — 自动生成 sitemap.xml (`/sitemap.xml`)

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 15 (App Router, Edge Runtime) |
| 语言 | TypeScript 5 |
| 数据库 | SQLite (better-sqlite3) |
| ORM | Drizzle ORM |
| 样式 | CSS Modules + 自定义属性变量 |
| 编辑器 | Tiptap (基于 ProseMirror) |
| 认证 | 自定义 JWT (jose + bcryptjs) |
| 图标 | Lucide React |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm / bun

### 安装

```bash
# 克隆仓库
git clone https://github.com/xiaopeng719/void-log.git
cd void-log

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，修改 AUTH_SECRET 为随机字符串
```

### 启动

```bash
# 开发模式
npm run dev
# 访问 http://localhost:3000

# 生产模式
npm run build
npm start
```

### 初始化管理员账号

首次启动后，访问 `/login` 使用默认管理员账号登录：

- **邮箱**: admin@voidlog.com
- **密码**: voidlog2026

> ⚠️ 建议首次登录后在「设置」→「账户管理」中修改密码。

## 📁 项目结构

```
void-log/
├── src/
│   ├── app/
│   │   ├── (admin)/              # 管理后台路由组
│   │   │   ├── dashboard/        # 仪表盘（真实数据统计）
│   │   │   ├── posts/            # 文章列表 / 新建 / 编辑
│   │   │   ├── comments/          # 评论审核
│   │   │   ├── settings/          # 站点设置 + 账户管理
│   │   │   └── styles/            # 样式管理
│   │   ├── api/                   # API 路由
│   │   │   ├── auth/
│   │   │   │   ├── login/         # POST 登录
│   │   │   │   ├── me/            # GET 当前用户
│   │   │   │   └── [...nextauth]/ # NextAuth v4
│   │   │   ├── users/             # 用户 CRUD
│   │   │   ├── posts/             # 文章 CRUD
│   │   │   ├── comments/          # 评论 CRUD
│   │   │   ├── styles/            # 样式 CRUD
│   │   │   └── settings/          # 设置 CRUD
│   │   ├── login/                 # 登录页
│   │   ├── posts/[id]/            # 公开文章页（按 ID 而非 slug）
│   │   ├── rss.xml/               # RSS Feed
│   │   ├── sitemap.xml/            # 站点地图
│   │   ├── page.tsx               # 首页
│   │   └── layout.tsx             # 根布局
│   ├── components/
│   │   ├── admin/                 # 管理后台组件
│   │   └── public/                # 公共组件（含评论组件）
│   └── lib/
│       ├── auth.ts                # NextAuth v4 配置
│       ├── db/                    # Drizzle ORM + SQLite
│       │   ├── index.ts           # 数据库连接
│       │   └── schema.ts          # 表结构定义
│       └── utils.ts               # 工具函数
├── data/
│   └── void-log.db                # SQLite 数据库文件
├── public/                        # 静态资源
├── .env                           # 环境变量（不提交）
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🔑 环境变量

```bash
# .env.local

# JWT 签名密钥（必填，建议使用 32+ 字符随机字符串）
AUTH_SECRET=your-random-secret-here

# 站点 URL（生产环境必填）
AUTH_URL=https://your-domain.com

# 允许代理（生产环境设为 1）
AUTH_TRUST_HOST=1
```

## 🌐 API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录，返回 JWT cookie |
| GET | `/api/auth/me` | 获取当前登录用户信息 |

### 用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users` | 获取所有用户列表 |
| POST | `/api/users` | 创建新用户 |
| GET | `/api/users/[id]` | 获取单个用户信息 |
| PUT | `/api/users/[id]` | 更新用户信息（含密码修改） |
| DELETE | `/api/users/[id]` | 删除用户 |

### 文章

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/posts` | 获取文章列表 |
| POST | `/api/posts` | 创建文章 |
| GET | `/api/posts/[id]` | 获取单篇文章 |
| PUT | `/api/posts/[id]` | 更新文章 |
| DELETE | `/api/posts/[id]` | 删除文章 |

### 评论

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/comments` | 获取评论列表 |
| POST | `/api/comments` | 创建评论 |
| PUT | `/api/comments/[id]` | 审核评论 |
| DELETE | `/api/comments/[id]` | 删除评论 |

### 设置

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取所有设置 |
| PUT | `/api/settings` | 更新设置 |

## 🔐 安全说明

- 密码使用 **bcryptjs** 哈希存储（加盐，10 轮）
- 会话使用 **JWT**（HS256 签名），存储在 HttpOnly + SameSite=Lax Cookie 中
- 管理后台所有路由受中间件保护，未登录访问自动跳转登录页
- 删除用户前需二次确认（防误删）

## 🎨 自定义主题

主题使用 CSS 自定义属性变量，编辑 `src/app/globals.css` 可快速自定义配色：

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --text-primary: #e4e4e7;
  --accent: #6366f1;
}
```

## 📄 许可证

MIT License
