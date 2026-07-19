# DiviSeek 寻息 - 后端 API 接口规范

> 本文档梳理了前端所有需要后端支持的功能接口，按模块分类，便于后续开发。

---

## 1. 认证模块 (Auth)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 注册 | POST | `/api/auth/register` | 手机号/邮箱注册 |
| 登录 | POST | `/api/auth/login` | 账号密码登录 |
| 发送验证码 | POST | `/api/auth/send-code` | 发送短信/邮箱验证码 |
| 刷新 Token | POST | `/api/auth/refresh` | 刷新访问令牌 |
| 退出登录 | POST | `/api/auth/logout` | 注销当前会话 |

---

## 2. 用户模块 (User)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取用户信息 | GET | `/api/user/profile` | 返回用户基本信息、会员等级、注册天数 |
| 更新用户信息 | PUT | `/api/user/profile` | 修改昵称、头像等 |
| 获取阅读统计 | GET | `/api/user/stats` | 累计阅读时长、收藏数、连续打卡天数 |
| 获取成就列表 | GET | `/api/user/achievements` | 寻息成就列表及解锁状态 |

---

## 3. 持仓模块 (Holdings)

### 数据结构

```typescript
type Holding = {
  ticker: string        // 股票代码 (如 "AAPL")
  name: string          // 公司名称 (如 "苹果公司")
  shares: number        // 持有股数
  yield: number         // 股息率 (%)
  frequency: "monthly" | "quarterly" | "semi-annual" | "annual"  // 派息频率
  nextExDate: string    // 下次除息日 (ISO 8601)
  annualIncome: number  // 年度预估股息收入 (¥)
  drip: boolean         // 是否开启股息再投资
  color: string         // 显示颜色
}
```

### 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取持仓列表 | GET | `/api/holdings` | 返回用户所有持仓，支持排序参数 |
| 获取持仓详情 | GET | `/api/holdings/:ticker` | 获取单只持仓详情 |
| 添加持仓 | POST | `/api/holdings` | 新增持仓（ticker, shares, drip） |
| 更新持仓 | PUT | `/api/holdings/:ticker` | 修改股数、Drip 设置等 |
| 删除持仓 | DELETE | `/api/holdings/:ticker` | 移除持仓 |
| 切换 DRIP | PATCH | `/api/holdings/:ticker/drip` | 开启/关闭股息再投资 |
| 获取组合汇总 | GET | `/api/holdings/summary` | 年度总收入、月均、平均收益率、持仓数 |

### 查询参数

```
GET /api/holdings?sort=yield|income|date&order=desc
```

---

## 4. 股息日历模块 (Dividend Calendar)

### 数据结构

```typescript
type DividendEvent = {
  id: string
  date: string          // 日期 (ISO 8601)
  ticker: string        // 股票代码
  name: string          // 公司名称
  perShare: number      // 每股派息金额
  shares: number        // 持有股数
  total: number         // 预计到账总额
  status: "confirmed" | "estimated"  // 已确认 / 预估
  method: "cash" | "drip"  // 现金 / 再投资
}
```

### 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取月度事件 | GET | `/api/dividends/calendar` | 按月获取股息事件 |
| 获取日期详情 | GET | `/api/dividends/calendar/:date` | 获取某日所有事件 |
| 获取未来30天 | GET | `/api/dividends/upcoming` | 未来30天内的除息事件 |

### 查询参数

```
GET /api/dividends/calendar?year=2026&month=7&type=ex|pay
```

- `type=ex`: 除息日事件
- `type=pay`: 派息日事件

---

## 5. 股票行情模块 (Stock Quotes)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 搜索股票 | GET | `/api/stocks/search` | 按代码或名称搜索 |
| 获取股票详情 | GET | `/api/stocks/:ticker` | 获取实时行情、股息率等 |
| 批量获取行情 | POST | `/api/stocks/batch` | 批量获取多只股票信息 |

### 查询参数

```
GET /api/stocks/search?q=AAPL
GET /api/stocks/AAPL
POST /api/stocks/batch  { tickers: ["AAPL", "KO", "JNJ"] }
```

---

## 6. 寻息学堂模块 (School / Articles)

### 数据结构

```typescript
type Article = {
  id: string
  title: string
  category: "投资经典" | "股息策略" | "财务分析" | "大师访谈" | "心智修炼"
  cover: string          // 封面图片 URL
  author: string
  readCount: number      // 阅读次数
  readMinutes: number    // 预计阅读时长（分钟）
  bookmarked: boolean    // 是否已收藏（用户维度）
  progress?: number      // 阅读进度 (0-1)
  excerpt: string        // 摘要
  content?: string       // 文章正文（阅读器打开时加载）
}
```

### 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取文章列表 | GET | `/api/articles` | 支持分类筛选、搜索、分页 |
| 获取文章详情 | GET | `/api/articles/:id` | 包含正文内容 |
| 获取精选文章 | GET | `/api/articles/hero` | 编辑精选 / Hero 文章 |
| 获取分类列表 | GET | `/api/articles/categories` | 所有文章分类 |
| 收藏文章 | POST | `/api/articles/:id/bookmark` | 添加收藏 |
| 取消收藏 | DELETE | `/api/articles/:id/bookmark` | 取消收藏 |
| 更新阅读进度 | PATCH | `/api/articles/:id/progress` | 上报阅读进度 |
| 标记已读 | POST | `/api/articles/:id/read` | 标记为已读 |
| 获取继续阅读列表 | GET | `/api/articles/continue` | 获取用户未读完的文章 |
| 获取阅读打卡 | GET | `/api/articles/streak` | 连续阅读天数、本周徽章 |

### 查询参数

```
GET /api/articles?category=股息策略&search=股息&page=1&limit=20
```

---

## 7. 每日金句模块 (Quotes)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取今日金句 | GET | `/api/quotes/today` | 返回当日金句 |
| 获取金句列表 | GET | `/api/quotes` | 分页获取金句库 |

---

## 8. 通知模块 (Notifications)

### 接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取通知设置 | GET | `/api/notifications/settings` | 获取用户的推送偏好 |
| 更新通知设置 | PUT | `/api/notifications/settings` | 更新推送偏好 |
| 获取未读通知 | GET | `/api/notifications` | 获取未读通知列表 |
| 标记已读 | PATCH | `/api/notifications/:id/read` | 标记单条已读 |
| 全部已读 | POST | `/api/notifications/read-all` | 全部标记已读 |

### 通知类型

```typescript
type NotificationSetting = {
  dividendReminder: boolean  // 除息提醒
  payoutArrival: boolean     // 派息到账
  articleUpdate: boolean     // 文章更新
}
```

---

## 9. 数据导出模块 (Export)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 导出年度报告 | GET | `/api/export/annual-report?year=2025` | 生成 PDF 年度股息报告 |
| 导出持仓数据 | GET | `/api/export/holdings-csv` | 导出持仓数据 CSV |
| 导出股息记录 | GET | `/api/export/dividends-csv?year=2025` | 导出股息流水 CSV |

---

## 10. 用户设置模块 (Settings)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取设置 | GET | `/api/settings` | 获取全部用户设置 |
| 更新货币单位 | PUT | `/api/settings/currency` | CNY / USD / EUR |
| 更新税率 | PUT | `/api/settings/tax-rate` | 股息税率 |
| 更新主题 | PUT | `/api/settings/theme` | 深色 / 浅色 |
| 更新日历起始 | PUT | `/api/settings/calendar-start` | 周日 / 周一 |

---

## 11. 推送订阅模块 (Push)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 订阅推送 | POST | `/api/push/subscribe` | 注册 FCM/Web Push 订阅 |
| 取消订阅 | DELETE | `/api/push/subscribe` | 取消推送订阅 |

---

## 12. 反馈模块 (Feedback)

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 提交反馈 | POST | `/api/feedback` | 提交用户反馈 |
| 获取常见问题 | GET | `/api/faq` | FAQ 列表 |

---

## 数据库核心表设计（参考）

```sql
-- 用户表
users (id, phone, email, nickname, avatar, membership_level, created_at)

-- 持仓表
holdings (id, user_id, ticker, name, shares, yield, frequency, next_ex_date, annual_income, drip, color, created_at, updated_at)

-- 股息事件表
dividend_events (id, user_id, ticker, date, per_share, shares, total, status, method, created_at)

-- 文章表
articles (id, title, category, cover, author, content, read_count, read_minutes, excerpt, created_at)

-- 用户阅读进度表
article_progress (id, user_id, article_id, progress, is_read, created_at, updated_at)

-- 文章收藏表
article_bookmarks (id, user_id, article_id, created_at)

-- 阅读打卡表
reading_streaks (id, user_id, date, created_at)

-- 用户设置表
user_settings (id, user_id, currency, tax_rate, theme, calendar_start, notification_dividend, notification_payout, notification_article, created_at, updated_at)

-- 通知表
notifications (id, user_id, title, body, type, is_read, created_at)

-- 金句表
quotes (id, text, author, created_at)

-- 反馈表
feedback (id, user_id, content, type, created_at)
```

---

## 优先级排序

### P0 - 核心功能（MVP 必须）
1. 认证模块（注册/登录）
2. 持仓模块（CRUD + DRIP）
3. 股息日历模块（查询 + 详情）
4. 股票行情模块（搜索 + 基本信息）

### P1 - 内容功能
5. 寻息学堂模块（文章列表 + 详情 + 收藏 + 进度）
6. 通知模块（设置 + 推送）
7. 每日金句模块

### P2 - 增值功能
8. 用户模块（统计 + 成就）
9. 数据导出模块
10. 用户设置模块
11. 反馈模块
