# DiviSeek（寻息）

股票股息追踪应用 —— 记录持仓、跟踪除息日、预估年度分红，支持中英双语界面与明暗主题。

🔗 线上地址：https://diviseek.com

## ✨ 功能

- **持仓管理** — 添加/编辑/删除股票持仓，记录成本价、买入日期、股息频率、再投资计划
- **股息日历** — 按除息日展示股息事件，一目了然未来派息安排
- **年化收益估算** — 根据各持仓股息率自动汇总年度分红（支持多币种）
- **学堂** — 内置文章阅读系统，记录阅读进度、书签收藏
- **成就体系** — 阅读与持仓行为解锁徽章
- **个人设置** — 币种、税率、主题（亮/暗）、日历起始日等个性化配置
- **手机号 + 密码认证** — JWT 会话管理

## 🛠️ 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · shadcn/ui |
| 后端 | Next.js Route Handlers · Prisma ORM |
| 数据库 | SQLite |
| 测试 | Vitest · Testing Library |
| 其他 | bcryptjs（密码哈希）· jsonwebtoken（JWT）· lucide-react（图标） |

## 🚀 本地运行

```bash
# 1. 安装依赖（推荐 pnpm）
pnpm install

# 2. 配置环境变量
cp .env.example .env   # 设置 DATABASE_URL 与 JWT_SECRET

# 3. 初始化数据库（含文章种子数据）
pnpm prisma migrate dev
pnpm tsx scripts/seed-articles.ts

# 4. 启动
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

## 📁 目录结构

```
app/                     — 页面与 API 路由
  api/                   — REST API（auth / holdings / calendar / articles / reading / bookmarks / achievements / stocks）
  layout.tsx / page.tsx  — 主 SPA 布局与路由
components/diviseek/     — 业务组件（仪表盘、持仓、日历、学堂、个人中心、成就）
lib/                     — 客户端 API、JWT 认证、工具函数
prisma/                  — 数据模型与迁移
scripts/                 — 数据种子与工具脚本
```

## 📝 环境变量

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | SQLite 数据库文件路径（如 `file:./dev.db`） |
| `JWT_SECRET` | 会话令牌签名密钥 |

## 🧪 测试

```bash
pnpm test        # 运行 vitest 测试
pnpm lint        # ESLint 检查
```

## 📄 License

MIT