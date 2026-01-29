# 🚀 PreFlow AI - 售前方案智能协作平台

> 基于 Next.js 16 + Tailwind v4 + Shadcn/UI 构建的高保真 AI 售前协作原型系统

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css)

</div>

---

## 📖 项目简介

**PreFlow AI** 是一个面向售前团队的智能协作平台原型，旨在通过 AI 技术提升方案编写效率、知识管理能力和投标响应速度。

### 核心能力

- **🤖 智能问答系统** - 基于企业知识库的上下文感知 AI 对话，支持引用溯源和 Markdown 渲染
- **📚 三级知识库** - 企业库/部门库/个人库分层管理，灵活检索
- **🎯 专业助手矩阵** - 文档生成、方案校验、资料归档、招投标解读等垂直场景助手
- **⚡ 流式交互体验** - 模拟真实 AI 打字效果、检索进度和深度思考过程
- **🎨 现代化 UI** - 参考 Linear/Notion 设计语言，细腻阴影与留白美学

---

## 🛠️ 技术栈

| 分类 | 技术选型 | 说明 |
|------|---------|------|
| **框架** | Next.js 16 (App Router) | 最新 React 框架，支持静态导出 |
| **UI 库** | Shadcn/UI + Radix UI | 无头组件库，高度可定制 |
| **样式** | Tailwind CSS v4 | 下一代 CSS 框架 |
| **图标** | Lucide React | 现代化图标库 |
| **反馈** | Sonner | 优雅的 Toast 提示 |
| **语言** | TypeScript | 强类型约束 |

---

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后，终端会显示两个访问地址：

```
✅ Ready for development!
   Local:   http://localhost:3000/PreFlow-AI/
   Deploy:  http://192.168.103.152:32080/PreFlow-AI/ (Target Server)
```

- **Local**: 本地开发调试地址
- **Deploy**: 目标部署服务器地址（需配置 `next.config.mjs` 中的 IP）

### 构建静态文件

```bash
npm run build
```

构建完成后，静态文件将输出到 `out/` 目录，可直接部署到任何静态服务器。

---

## 📂 项目结构

```
PreFlow-AI/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 全局布局（字体、元数据）
│   │   ├── page.tsx            # 主页面（智能问答界面）
│   │   └── globals.css         # 全局样式
│   ├── components/
│   │   ├── ui/                 # Shadcn 通用组件
│   │   ├── knowledge-base/     # 知识库相关组件
│   │   └── AIChatPanel.tsx     # AI 对话面板
│   ├── data/
│   │   ├── mock.ts             # 核心 Mock 数据（AI 回复逻辑）
│   │   └── kb-mock.ts          # 知识库 Mock 数据
│   ├── lib/
│   │   └── utils.ts            # 工具函数
│   └── types/
│       └── index.ts            # TypeScript 类型定义
├── public/                     # 静态资源
├── next.config.mjs             # Next.js 配置（含 basePath）
└── package.json
```

---

## 🎯 核心功能

### 1. 智能问答系统

- **上下文感知回复** - AI 根据用户提问返回结构化 Markdown 内容
- **引用溯源** - 回复包含明确的文档引用，支持点击预览原文
- **表格渲染** - 支持复杂的报价单、参数对比表等 Markdown 表格
- **流式输出** - 模拟真实 AI 打字效果

### 2. 知识库管理

- **三级架构** - 企业库、部门库、个人库分层管理
- **灵活检索** - 支持按分类或单库选择检索范围
- **状态模拟** - 文档数量统计、更新时间、收藏状态

### 3. 专业助手矩阵

| 助手 | 功能 |
|------|------|
| 📝 项目文档助手 | 生成文档、润色、合稿 |
| ✅ 项目校验助手 | 清单校验、查重、参数核对 |
| 📁 项目资料助手 | 资料归档检索 |
| ⚖️ 招投标助手 | 招标文件解读、智能报价 |

### 4. 交互细节

- **推荐问题** - 首页提供 "猜你想问" 引导探索
- **文件上传** - 模拟文件上传交互（UI 层面）
- **Toast 反馈** - 复制、提交等操作均有优雅提示
- **深度思考模式** - 模拟 AI 多步推理过程

---

## ⚙️ 配置说明

### 修改部署路径

编辑 `next.config.mjs`：

```javascript
const basePath = '/your-project-name'; // 修改为你的项目名称
```

### 修改部署服务器地址

编辑 `next.config.mjs` 中的 `deployUrl`：

```javascript
const deployUrl = `http://your-server-ip:port${basePath}/`;
```

---

## 🎨 设计系统

本项目遵循 "Linear Aesthetic" 设计语言：

- **留白** - 拥抱空间，多用 `p-6`, `gap-4`, `py-8`
- **阴影** - 细腻的 `shadow-sm`, `shadow-md`
- **边框** - 极细的 `border-slate-200` / `border-slate-800`
- **圆角** - 统一使用 `rounded-lg` 或 `rounded-xl`
- **反馈** - 任何操作必须触发 Toast 或 UI 状态变更

---

## 📝 开发规范

### Mock Data First

- 严禁等待后端 API
- 在组件内部创建丰富、逼真的 Mock 数据
- ❌ 不要使用: `User 1`, `Test Title`
- ✅ 应该使用: `Sarah Chen (Product Director)`, `Q3 季度财务汇报.pdf`

### 静态导出配置

- 必须在 `next.config.mjs` 中设置 `output: 'export'`
- 严禁使用 API Routes (`app/api/*`)、Server Actions 或 Middleware
- 图片必须使用 `<img />` 或 `<Image unoptimized />`
- 默认在 Page/Component 顶部声明 `"use client"`

### 状态管理

- 使用 React `useState` 模拟所有交互
- 增加/删除列表项必须在界面上实时反映

---

## 🔮 未来规划

- [ ] 对接真实后端 API
- [ ] 实现用户认证与权限管理
- [ ] 支持多租户知识库隔离
- [ ] 集成向量数据库（如 Pinecone/Weaviate）
- [ ] 接入真实 LLM（如 GPT-4/Claude）
- [ ] 添加协作编辑功能（类似 Notion）

---

## 📄 许可证

本项目为内部原型演示项目，暂不对外开源。

---

## 🤝 贡献指南

本项目目前处于原型阶段，暂不接受外部贡献。如有建议或问题，请联系项目负责人。

---

<div align="center">

**Built with ❤️ by PreFlow AI Team**

</div>
