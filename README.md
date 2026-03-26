# ☯ 紫微斗数 · AI 算命

基于紫微斗数传统命理学的 AI 智能解盘应用。输入生辰八字，自动排盘并由 AI 大模型进行专业命理解读，支持多轮追问交互。

## ✨ 功能特色

- **自动排盘** — 基于 [iztro](https://github.com/SylarLong/iztro) 库，精确计算紫微斗数命盘（十二宫、主星、辅星、四化等）
- **AI 解读** — 接入大语言模型（如 qwen3.5），从命格、事业、财运、婚姻、健康等维度进行专业解读
- **追问交互** — 解读完成后可继续向"大师"追问，支持多轮对话
- **道家紫金风格 UI** — 金色/朱砂/玉绿配色，八卦旋转动画，紫金流光效果，沉浸式命理体验
- **农历/阳历双支持** — 可选阳历或农历输入生辰

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 排盘 | [iztro](https://github.com/SylarLong/iztro) |
| AI | OpenAI 兼容 API |
| 部署 | Vercel / 自托管 |

## 📁 项目结构

```
ziwei-fortune/
├── src/app/
│   ├── page.tsx              # 主页面（排盘UI + 命盘渲染 + AI解读 + 追问）
│   ├── layout.tsx            # 全局布局
│   ├── globals.css           # 道家紫金主题样式
│   └── api/
│       ├── chart/route.ts    # 排盘API（调用iztro生成命盘数据）
│       ├── fortune/route.ts  # AI解读API（生成命理解读）
│       └── chat/route.ts     # 追问API（多轮对话）
├── .env.example              # 环境变量示例
├── package.json
└── README.md
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/JunQHuang/AI-Ziwei-Fortune.git
cd AI-Ziwei-Fortune
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 AI API 配置：

```env
AI_API_KEY=your-api-key-here
AI_API_BASE=https://api.openai.com/v1
AI_MODEL=qwen3.5:397b
```

> 支持任何 OpenAI 兼容的 API 接口（如 OpenAI、通义千问、DeepSeek 等）

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 📖 使用说明

1. 选择**历法**（阳历/农历）和**性别**
2. 输入**出生日期**和**出生时辰**
3. 点击 **「起盘论命」**
4. 查看 **命盘** 标签页 — 完整的紫微斗数十二宫命盘
5. 切换 **AI 解读** 标签页 — AI 大师的详细命理分析
6. 在解读下方的 **追问区域** 继续提问

## 🎨 界面预览

- 道家风格深色主题，楷体字体
- 紫金渐变流光标题与边框
- 八卦图旋转加载动画
- 星辰粒子背景
- 命盘宫格支持 hover 交互

## ⚠️ 免责声明

本应用仅供娱乐和学习用途，AI 命理解读**不构成任何专业建议**。请理性看待，切勿迷信。

## 📄 License

MIT
