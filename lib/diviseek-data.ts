export type Frequency = "monthly" | "quarterly" | "semi-annual" | "annual"

export type Holding = {
  ticker: string
  name: string
  shares: number
  yield: number
  frequency: Frequency
  nextExDate: string
  annualIncome: number
  drip: boolean
  color: string
  avgCost?: number | null
  purchaseDate?: string | null
  market?: string
}

export const freqLabel: Record<Frequency, string> = {
  monthly: "月度",
  quarterly: "季度",
  "semi-annual": "半年",
  annual: "年度",
}

export const holdings: Holding[] = [
  {
    ticker: "AAPL",
    name: "苹果公司",
    shares: 120,
    yield: 2.6,
    frequency: "quarterly",
    nextExDate: "2026-07-18",
    annualIncome: 7680,
    drip: true,
    color: "#64748b",
  },
  {
    ticker: "KO",
    name: "可口可乐",
    shares: 200,
    yield: 3.1,
    frequency: "quarterly",
    nextExDate: "2026-07-22",
    annualIncome: 8940,
    drip: true,
    color: "#ef4444",
  },
  {
    ticker: "JNJ",
    name: "强生公司",
    shares: 80,
    yield: 3.4,
    frequency: "quarterly",
    nextExDate: "2026-07-26",
    annualIncome: 6420,
    drip: false,
    color: "#3b82f6",
  },
  {
    ticker: "O",
    name: "地产收益",
    shares: 150,
    yield: 5.6,
    frequency: "monthly",
    nextExDate: "2026-07-15",
    annualIncome: 9860,
    drip: true,
    color: "#f59e0b",
  },
  {
    ticker: "PG",
    name: "宝洁公司",
    shares: 60,
    yield: 2.9,
    frequency: "quarterly",
    nextExDate: "2026-08-02",
    annualIncome: 5120,
    drip: false,
    color: "#0ea5e9",
  },
  {
    ticker: "PEP",
    name: "百事公司",
    shares: 45,
    yield: 3.2,
    frequency: "quarterly",
    nextExDate: "2026-07-30",
    annualIncome: 4180,
    drip: true,
    color: "#14b8a6",
  },
  {
    ticker: "MCD",
    name: "麦当劳",
    shares: 30,
    yield: 2.4,
    frequency: "quarterly",
    nextExDate: "2026-08-05",
    annualIncome: 3200,
    drip: false,
    color: "#dc2626",
  },
  {
    ticker: "MSFT",
    name: "微软公司",
    shares: 25,
    yield: 1.9,
    frequency: "quarterly",
    nextExDate: "2026-08-14",
    annualIncome: 3120,
    drip: true,
    color: "#22c55e",
  },
]

export const portfolioSummary = {
  annualIncome: 48520,
  monthlyAverage: 4043,
  holdingsCount: holdings.length,
  averageYield: 3.8,
}

export type CalendarEvent = {
  date: string
  ticker: string
  name: string
  perShare: number
  shares: number
  total: number
  status: "confirmed" | "estimated"
  method: "cash" | "drip"
}

// events within the next weeks + across the month for the calendar
export const dividendEvents: CalendarEvent[] = [
  { date: "2026-07-15", ticker: "O", name: "地产收益", perShare: 0.548, shares: 150, total: 82, status: "confirmed", method: "drip" },
  { date: "2026-07-18", ticker: "AAPL", name: "苹果公司", perShare: 0.25, shares: 120, total: 30, status: "confirmed", method: "drip" },
  { date: "2026-07-22", ticker: "KO", name: "可口可乐", perShare: 0.485, shares: 200, total: 97, status: "confirmed", method: "drip" },
  { date: "2026-07-26", ticker: "JNJ", name: "强生公司", perShare: 1.24, shares: 80, total: 99, status: "estimated", method: "cash" },
  { date: "2026-07-30", ticker: "PEP", name: "百事公司", perShare: 1.42, shares: 45, total: 64, status: "confirmed", method: "drip" },
  { date: "2026-08-02", ticker: "PG", name: "宝洁公司", perShare: 1.01, shares: 60, total: 61, status: "estimated", method: "cash" },
  { date: "2026-08-05", ticker: "MCD", name: "麦当劳", perShare: 1.67, shares: 30, total: 50, status: "estimated", method: "cash" },
  { date: "2026-08-14", ticker: "MSFT", name: "微软公司", perShare: 0.83, shares: 25, total: 21, status: "estimated", method: "drip" },
  { date: "2026-08-15", ticker: "O", name: "地产收益", perShare: 0.548, shares: 150, total: 82, status: "estimated", method: "drip" },
]

export const quotes = [
  { text: "价格是你付出的，价值是你得到的", author: "巴菲特" },
  { text: "投资的第一条原则是不要亏钱，第二条是永远记住第一条", author: "巴菲特" },
  { text: "市场先生每天都会报价，但你不必每天都理会他", author: "格雷厄姆" },
  { text: "复利是世界第八大奇迹，懂它的人赚取它，不懂的人支付它", author: "爱因斯坦" },
  { text: "反过来想，总是反过来想", author: "查理·芒格" },
]

export type Category = "投资经典" | "股息策略" | "财务分析" | "大师访谈" | "心智修炼"

export type Article = {
  id: string
  title: string
  category: Category
  cover: string
  author: string
  readCount: number
  readMinutes: number
  bookmarked: boolean
  progress?: number
  excerpt: string
}

export const categories = ["全部", "投资经典", "股息策略", "财务分析", "大师访谈", "心智修炼"] as const

export const heroArticle: Article = {
  id: "hero",
  title: "巴菲特的股息复利哲学",
  category: "投资经典",
  cover: "/images/hero-buffett.png",
  author: "寻息编辑部",
  readCount: 12840,
  readMinutes: 12,
  bookmarked: true,
  excerpt:
    "从一杯可口可乐到伯克希尔的万亿版图，巴菲特用一生诠释了股息与复利如何将时间变成最强大的盟友。",
}

export const articles: Article[] = [
  {
    id: "a1",
    title: "股息贵族：连续25年增长的秘密",
    category: "股息策略",
    cover: "/images/article-dividend.png",
    author: "李维",
    readCount: 5230,
    readMinutes: 8,
    bookmarked: false,
    progress: 0.65,
    excerpt: "为什么持续增长的股息比高股息率更重要？揭开股息贵族的护城河。",
  },
  {
    id: "a2",
    title: "复利曲线：时间的朋友",
    category: "投资经典",
    cover: "/images/article-compound.png",
    author: "王思远",
    readCount: 8120,
    readMinutes: 10,
    bookmarked: true,
    progress: 0.3,
    excerpt: "一张图看懂复利如何在后期加速，以及为什么越早开始越好。",
  },
  {
    id: "a3",
    title: "读懂现金流量表的三个维度",
    category: "财务分析",
    cover: "/images/article-analysis.png",
    author: "陈默",
    readCount: 3410,
    readMinutes: 14,
    bookmarked: false,
    excerpt: "自由现金流才是股息的真正来源，学会分辨真实的分红能力。",
  },
  {
    id: "a4",
    title: "芒格：耐心是最大的优势",
    category: "心智修炼",
    cover: "/images/article-mind.png",
    author: "寻息编辑部",
    readCount: 6740,
    readMinutes: 9,
    bookmarked: false,
    excerpt: "在等待中积累，在平静中前行，芒格的心智模型如何塑造投资纪律。",
  },
]

export const continueReading: Article[] = [
  articles[0],
  articles[1],
]
