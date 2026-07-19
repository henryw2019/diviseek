export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  annualDividend: number;
  yieldPercent: number;
  nextPayDate: string;
  dripEnabled: boolean;
  confirmed: boolean;
}

export interface DividendEvent {
  date: string;
  ticker: string;
  amount: number;
  confirmed: boolean;
  type: "ex" | "pay";
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  readProgress: number;
  coverColor: string;
  author: string;
  readTime: number;
  quote?: { text: string; author: string };
  tags: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  { text: "市场先生每天都会报价，但你不必每天都理会他", author: "格雷厄姆" },
  { text: "别人贪婪时我恐惧，别人恐惧时我贪婪", author: "巴菲特" },
  { text: "反过来想，总是反过来想", author: "查理·芒格" },
  { text: "投资的第一条准则是不要赔钱，第二条准则是永远不要忘记第一条", author: "巴菲特" },
  { text: "时间是优秀企业的朋友，是平庸企业的敌人", author: "巴菲特" },
];

export const holdings: Holding[] = [
  { id: "1", ticker: "O", name: "地产收益", shares: 150, annualDividend: 9860, yieldPercent: 5.6, nextPayDate: "07-15", dripEnabled: true, confirmed: true },
  { id: "2", ticker: "KO", name: "可口可乐", shares: 200, annualDividend: 8940, yieldPercent: 3.1, nextPayDate: "07-22", dripEnabled: true, confirmed: true },
  { id: "3", ticker: "AAPL", name: "苹果公司", shares: 120, annualDividend: 7680, yieldPercent: 2.6, nextPayDate: "07-18", dripEnabled: false, confirmed: true },
  { id: "4", ticker: "JNJ", name: "强生公司", shares: 80, annualDividend: 6420, yieldPercent: 3.4, nextPayDate: "07-26", dripEnabled: true, confirmed: true },
  { id: "5", ticker: "PG", name: "宝洁公司", shares: 100, annualDividend: 5800, yieldPercent: 2.8, nextPayDate: "07-10", dripEnabled: false, confirmed: false },
  { id: "6", ticker: "V", name: "维萨卡", shares: 60, annualDividend: 4200, yieldPercent: 0.8, nextPayDate: "08-01", dripEnabled: true, confirmed: false },
  { id: "7", ticker: "JPM", name: "摩根大通", shares: 90, annualDividend: 3960, yieldPercent: 2.2, nextPayDate: "08-05", dripEnabled: false, confirmed: false },
  { id: "8", ticker: "MSFT", name: "微软公司", shares: 70, annualDividend: 1660, yieldPercent: 0.7, nextPayDate: "08-12", dripEnabled: true, confirmed: false },
];

export function getDividendEvents(year: number, month: number): DividendEvent[] {
  const events: DividendEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (const h of holdings) {
    const [payMonth, payDay] = h.nextPayDate.split("-").map(Number);
    if (payMonth === month + 1) {
      events.push({
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(payDay).padStart(2, "0")}`,
        ticker: h.ticker,
        amount: Math.round(h.annualDividend / 12),
        confirmed: h.confirmed,
        type: "pay",
      });
      const exDay = Math.max(1, payDay - 2);
      events.push({
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(exDay).padStart(2, "0")}`,
        ticker: h.ticker,
        amount: Math.round(h.annualDividend / 12),
        confirmed: h.confirmed,
        type: "ex",
      });
    }
  }

  return events;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "股息贵族：连续 50 年以上加息的公司",
    summary: "深入了解那些穿越牛熊、持续为股东创造价值的企业",
    category: "股息策略",
    readProgress: 65,
    coverColor: "from-amber-600 to-yellow-500",
    author: "寻息研究院",
    readTime: 8,
    quote: { text: "时间是好公司的朋友", author: "巴菲特" },
    tags: ["O", "KO", "JNJ", "PG"],
  },
  {
    id: "2",
    title: "DRIP 再投资的复利奇迹",
    summary: "股息再投资如何让你的财富在 20 年内翻倍",
    category: "投资入门",
    readProgress: 0,
    coverColor: "from-emerald-600 to-teal-500",
    author: "寻息学堂",
    readTime: 12,
    quote: { text: "复利是世界第八大奇迹", author: "爱因斯坦" },
    tags: [],
  },
  {
    id: "3",
    title: "如何构建月度现金流组合",
    summary: "通过分散派息日期实现每月稳定现金流",
    category: "组合构建",
    readProgress: 30,
    coverColor: "from-blue-600 to-indigo-500",
    author: "资产配置组",
    readTime: 15,
    tags: [],
  },
  {
    id: "4",
    title: "房地产信托基金（REITs）入门指南",
    summary: "高收益背后的风险与机遇分析",
    category: "REITs",
    readProgress: 0,
    coverColor: "from-purple-600 to-pink-500",
    author: "寻息研究院",
    readTime: 10,
    tags: ["O"],
  },
];

export const categories = ["全部", "股息策略", "投资入门", "组合构建", "REITs"];

export const totalAnnualDividend = holdings.reduce((sum, h) => sum + h.annualDividend, 0);
