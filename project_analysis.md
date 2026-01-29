# 🔍 项目分析报告：Smart QA Prototype (售前方案智能协作平台)

## 1. 项目概览 (Overview)
这是一个基于 **Next.js 16 (App Router)** 构建的高保真 **售前方案智能协作平台** 原型。该项目旨在帮助售前团队通过 AI 助手快速检索企业知识库、生成招投标文档、对比竞品参数以及校验技术方案。

目前项目处于 **Phase 2: Rapid Prototyping** 阶段，采用 "Mock Data First" 策略，前端包含完整的交互逻辑和逼真的演示数据，但尚未对接真实后端 API。

## 2. 技术栈 (Tech Stack)
该项目采用了最前沿的 "AI Golden Stack"：

*   **Framework**: [Next.js 16.1.1](https://nextjs.org/) (App Router) - 最新版本的 React 框架。
*   **Core**: React 19.2.3 - 使用了最新的 React Hooks (`useActionState` 等潜在特性)。
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Beta) - 下一代 CSS 框架，配合 `tailwind-merge` 和 `clsx` 实现动态样式类管理。
*   **UI Library**: [Shadcn/UI](https://ui.shadcn.com/) (based on @radix-ui) - 无头组件库，提供高度可定制的专业级 UI。
*   **Icons**: [Lucide React](https://lucide.dev/) - 现代化、一致的图标库。
*   **Feedback**: Sonner - 优雅的 Toast 提示组件。
*   **Language**: TypeScript - 强类型约束，确保代码健壮性。

## 3. 项目结构 (Project Structure)
```
smart-qa-prototype-master/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 全局布局 (字体、元数据)
│   │   ├── page.tsx        # 核心页面：智能问答主界面 (包含聊天、侧边栏逻辑)
│   │   └── globals.css     # 全局样式 & Tailwind 配置
│   ├── components/
│   │   └── ui/             # Shadcn 通用组件 (Button, Input, ScrollArea etc.)
│   ├── data/
│   │   └── mock.ts         # 核心 Mock 数据源 (知识库、助手、历史记录、AI回复逻辑)
│   ├── lib/
│   │   └── utils.ts        # 工具函数 (cn class merger)
│   └── types/              # TypeScript 类型定义
├── public/                 # 静态资源
└── package.json            # 依赖管理
```

## 4. 核心功能 (Key Features)

### 4.1 智能问答系统 (Smart Q&A)
*   **上下文感知回复**: 模拟 AI 根据用户提问（如 "招标要求"、"竞品对比"）返回结构化的 Markdown 回复。
*   **引用溯源 (Citations)**: AI 回复包含明确的引用来源（如《XX项目采购招标文件.pdf》），支持点击预览。
*   **Markdown 渲染**: 支持渲染复杂的表格（如报价单、参数对比表）、标题、列表和加粗文本。

### 4.2 知识库管理 (Knowledge Base Knowledge)
*   **多级架构**: 支持 **企业库**、**部门库**、**个人库** 三级知识库体系。
*   **交互式选择器**: 用户可以按分类（Section）或按单库（Base）灵活选择检索范围。
*   **状态模拟**: 包含文档数量统计、更新时间及收藏状态。

### 4.3 专业助手矩阵 (Specialized Assistants)
除了通用问答，系统预置了四个垂直领域的 AI 助手（Mock 数据已定义）：
1.  **项目文档助手**: 生成文档、润色、合稿。
2.  **项目校验助手**: 清单校验、查重、参数核对。
3.  **项目资料助手**: 资料归档检索。
4.  **招投标助手**: 招标文件解读、智能报价。

### 4.4 交互细节 (Interactive Details)
*   **流式体验**: 模拟 AI 打字机效果和网络延迟。
*   **推荐问题**: 首页提供 "猜你想问" 引导用户探索。
*   **文件上传**: 模拟文件上传交互（UI 层面）。
*   **Toast 反馈**: 复制内容、提交操作均有优雅的 Toast 提示。

## 5. 数据模型 (Data Model)
核心数据结构定义在 `src/types` 和 `mock.ts` 中，体现了清晰的业务逻辑：
*   `KnowledgeBase`: 包含 `id`, `name`, `type` (enterprise/dept/personal), `documentCount`.
*   `Assistant`: 包含 `id`, `name`, `icon`, `description`.
*   `Message`: 包含 `role` (user/assistant), `content`, `citations`.

## 6. 观察与建议 (Observations & Recommendations)
*   **代码组织**: 目前 `page.tsx` 接近 1800 行，包含了大量 UI 组件（KnowledgeBaseSelector）和业务逻辑。建议在后续开发中将 `KnowledgeBaseSelector`、`ChatMessage`、`Sidebar` 等拆分为独立的 React 组件，放入 `src/components` 目录，以提高可维护性。
*   **样式系统**: 使用了 Tailwind v4，这是一个前瞻性的选择，能够减少配置文件的复杂度。
*   **演示效果**: Mock 数据非常详实（包含具体的设备型号 A-3000、价格、参数），非常适合向 Stakeholders（利益相关者）演示。
