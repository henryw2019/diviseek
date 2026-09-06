import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface StockSeed {
  ticker: string; name: string; sector: string; industry: string
  price: number; dividendYield: number; frequency: string
  dividendPerShare: number; exDate: string; payDate: string
  divGrowth1y: number; divGrowth3y: number; divGrowth5y: number
  divYears: number; payoutRatio: number; marketCap: number; peRatio: number
  market: string; currency: string
}

const S = 1e9 // shorthand for billion market cap

// ── Real market prices as of Jul 21, 2026 ──
// US stock prices sourced from stockanalysis.com, A-share from news reports

const usStocks: StockSeed[] = [
  // ═══ Dividend Kings (50+ years) ═══
  { ticker:"KO", name:"可口可乐", sector:"日常消费", industry:"软饮料", price:81.97, dividendYield:3.1, frequency:"quarterly", dividendPerShare:0.64, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:4.2, divGrowth3y:3.8, divGrowth5y:3.5, divYears:63, payoutRatio:0.75, marketCap:312*S, peRatio:23.5, market:"US", currency:"USD" },
  { ticker:"PG", name:"宝洁公司", sector:"日常消费", industry:"家居用品", price:148.10, dividendYield:2.9, frequency:"quarterly", dividendPerShare:1.07, exDate:"2026-08-02", payDate:"2026-08-16", divGrowth1y:5.1, divGrowth3y:4.5, divGrowth5y:4.0, divYears:67, payoutRatio:0.68, marketCap:415*S, peRatio:27.1, market:"US", currency:"USD" },
  { ticker:"JNJ", name:"强生公司", sector:"医疗健康", industry:"制药", price:250.61, dividendYield:3.4, frequency:"quarterly", dividendPerShare:2.13, exDate:"2026-07-26", payDate:"2026-08-10", divGrowth1y:3.5, divGrowth3y:3.2, divGrowth5y:3.0, divYears:62, payoutRatio:0.80, marketCap:385*S, peRatio:25.3, market:"US", currency:"USD" },
  { ticker:"MCD", name:"麦当劳", sector:"日常消费", industry:"快餐", price:263.91, dividendYield:2.4, frequency:"quarterly", dividendPerShare:1.58, exDate:"2026-08-05", payDate:"2026-08-19", divGrowth1y:8.2, divGrowth3y:7.5, divGrowth5y:6.8, divYears:48, payoutRatio:0.65, marketCap:215*S, peRatio:26.8, market:"US", currency:"USD" },
  { ticker:"PEP", name:"百事公司", sector:"日常消费", industry:"软饮料/零食", price:135.00, dividendYield:3.2, frequency:"quarterly", dividendPerShare:1.08, exDate:"2026-07-30", payDate:"2026-08-13", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:52, payoutRatio:0.70, marketCap:250*S, peRatio:24.1, market:"US", currency:"USD" },
  { ticker:"LOW", name:"劳氏公司", sector:"非日常消费", industry:"家居建材", price:265.80, dividendYield:2.0, frequency:"quarterly", dividendPerShare:1.33, exDate:"2026-08-08", payDate:"2026-08-22", divGrowth1y:12.5, divGrowth3y:15.2, divGrowth5y:16.8, divYears:58, payoutRatio:0.55, marketCap:152*S, peRatio:24.5, market:"US", currency:"USD" },
  { ticker:"CAT", name:"卡特彼勒", sector:"工业", industry:"工程机械", price:378.20, dividendYield:2.1, frequency:"quarterly", dividendPerShare:1.98, exDate:"2026-07-15", payDate:"2026-07-30", divGrowth1y:8.8, divGrowth3y:7.2, divGrowth5y:6.5, divYears:29, payoutRatio:0.45, marketCap:192*S, peRatio:20.3, market:"US", currency:"USD" },
  { ticker:"MMM", name:"3M公司", sector:"工业", industry:"工业综合", price:128.50, dividendYield:3.8, frequency:"quarterly", dividendPerShare:1.22, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:1.2, divGrowth3y:1.0, divGrowth5y:0.8, divYears:64, payoutRatio:0.82, marketCap:70*S, peRatio:16.2, market:"US", currency:"USD" },
  { ticker:"EMR", name:"艾默生电气", sector:"工业", industry:"自动化", price:118.40, dividendYield:3.6, frequency:"quarterly", dividendPerShare:1.07, exDate:"2026-07-10", payDate:"2026-07-25", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.2, divYears:58, payoutRatio:0.78, marketCap:67*S, peRatio:18.5, market:"US", currency:"USD" },
  { ticker:"ADP", name:"自动数据处理", sector:"科技", industry:"HR软件", price:295.60, dividendYield:1.9, frequency:"quarterly", dividendPerShare:1.40, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:12.0, divGrowth3y:10.5, divGrowth5y:9.8, divYears:47, payoutRatio:0.55, marketCap:120*S, peRatio:32.4, market:"US", currency:"USD" },
  { ticker:"TROW", name:"普信集团", sector:"金融", industry:"资产管理", price:118.20, dividendYield:4.3, frequency:"quarterly", dividendPerShare:1.27, exDate:"2026-07-20", payDate:"2026-08-03", divGrowth1y:5.5, divGrowth3y:6.2, divGrowth5y:5.8, divYears:36, payoutRatio:0.85, marketCap:28*S, peRatio:14.8, market:"US", currency:"USD" },
  // ═══ Dividend Aristocrats (25+ years) ═══
  { ticker:"O", name:"房地产收益", sector:"房地产", industry:"REIT-零售", price:56.80, dividendYield:5.6, frequency:"monthly", dividendPerShare:0.265, exDate:"2026-07-15", payDate:"2026-08-01", divGrowth1y:3.5, divGrowth3y:3.0, divGrowth5y:2.8, divYears:27, payoutRatio:0.85, marketCap:48*S, peRatio:42.5, market:"US", currency:"USD" },
  { ticker:"HD", name:"家得宝", sector:"非日常消费", industry:"家居建材", price:385.40, dividendYield:2.5, frequency:"quarterly", dividendPerShare:2.41, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:10.2, divGrowth3y:9.5, divGrowth5y:15.8, divYears:15, payoutRatio:0.52, marketCap:385*S, peRatio:24.7, market:"US", currency:"USD" },
  { ticker:"MDLZ", name:"亿滋国际", sector:"日常消费", industry:"零食", price:72.80, dividendYield:2.3, frequency:"quarterly", dividendPerShare:0.42, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:7.2, divYears:12, payoutRatio:0.52, marketCap:97*S, peRatio:22.1, market:"US", currency:"USD" },
  { ticker:"CL", name:"高露洁", sector:"日常消费", industry:"个人护理", price:98.60, dividendYield:2.5, frequency:"quarterly", dividendPerShare:0.62, exDate:"2026-07-24", payDate:"2026-08-07", divGrowth1y:4.8, divGrowth3y:4.2, divGrowth5y:3.8, divYears:60, payoutRatio:0.72, marketCap:82*S, peRatio:28.5, market:"US", currency:"USD" },
  { ticker:"KMB", name:"金佰利", sector:"日常消费", industry:"个人护理", price:146.20, dividendYield:3.7, frequency:"quarterly", dividendPerShare:1.35, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:3.2, divGrowth3y:2.8, divGrowth5y:2.5, divYears:48, payoutRatio:0.82, marketCap:49*S, peRatio:22.0, market:"US", currency:"USD" },
  { ticker:"ABT", name:"雅培", sector:"医疗健康", industry:"医疗设备", price:118.50, dividendYield:2.0, frequency:"quarterly", dividendPerShare:0.59, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:12.8, divGrowth3y:11.5, divGrowth5y:10.2, divYears:48, payoutRatio:0.48, marketCap:205*S, peRatio:26.3, market:"US", currency:"USD" },
  { ticker:"ITW", name:"伊利诺伊工具", sector:"工业", industry:"工业制造", price:268.40, dividendYield:2.3, frequency:"quarterly", dividendPerShare:1.54, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:31, payoutRatio:0.58, marketCap:81*S, peRatio:24.8, market:"US", currency:"USD" },
  { ticker:"SYY", name:"西斯科", sector:"非日常消费", industry:"食品服务", price:78.50, dividendYield:2.6, frequency:"quarterly", dividendPerShare:0.51, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:7.0, divGrowth3y:6.2, divGrowth5y:5.8, divYears:15, payoutRatio:0.62, marketCap:39*S, peRatio:22.5, market:"US", currency:"USD" },
  { ticker:"WMT", name:"沃尔玛", sector:"日常消费", industry:"大型零售商", price:95.80, dividendYield:1.5, frequency:"quarterly", dividendPerShare:0.36, exDate:"2026-07-20", payDate:"2026-08-03", divGrowth1y:12.0, divGrowth3y:10.5, divGrowth5y:9.2, divYears:49, payoutRatio:0.38, marketCap:770*S, peRatio:31.5, market:"US", currency:"USD" },
  { ticker:"APD", name:"空气化工", sector:"材料", industry:"工业气体", price:285.60, dividendYield:2.5, frequency:"quarterly", dividendPerShare:1.79, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.0, divGrowth3y:7.2, divGrowth5y:6.5, divYears:38, payoutRatio:0.60, marketCap:63*S, peRatio:24.1, market:"US", currency:"USD" },
  // ═══ High Yield (4%+) ═══
  { ticker:"T", name:"AT&T", sector:"电信", industry:"综合电信", price:28.40, dividendYield:5.5, frequency:"quarterly", dividendPerShare:0.39, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:-2.5, divGrowth3y:1.2, divGrowth5y:-15.0, divYears:18, payoutRatio:0.60, marketCap:202*S, peRatio:10.5, market:"US", currency:"USD" },
  { ticker:"VZ", name:"威瑞森", sector:"电信", industry:"综合电信", price:42.30, dividendYield:6.2, frequency:"quarterly", dividendPerShare:0.66, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:1.8, divGrowth3y:2.0, divGrowth5y:2.1, divYears:20, payoutRatio:0.55, marketCap:178*S, peRatio:8.5, market:"US", currency:"USD" },
  { ticker:"PFE", name:"辉瑞", sector:"医疗健康", industry:"制药", price:38.50, dividendYield:5.0, frequency:"quarterly", dividendPerShare:0.48, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:0.0, divGrowth3y:2.5, divGrowth5y:3.8, divYears:15, payoutRatio:0.90, marketCap:217*S, peRatio:11.2, market:"US", currency:"USD" },
  { ticker:"MO", name:"奥驰亚", sector:"日常消费", industry:"烟草", price:52.60, dividendYield:7.5, frequency:"quarterly", dividendPerShare:0.99, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:4.8, divGrowth3y:5.2, divGrowth5y:5.5, divYears:15, payoutRatio:0.82, marketCap:89*S, peRatio:9.8, market:"US", currency:"USD" },
  { ticker:"PM", name:"菲利普莫里斯", sector:"日常消费", industry:"烟草", price:118.50, dividendYield:5.0, frequency:"quarterly", dividendPerShare:1.48, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.2, divGrowth3y:5.5, divGrowth5y:5.0, divYears:15, payoutRatio:0.78, marketCap:184*S, peRatio:17.2, market:"US", currency:"USD" },
  { ticker:"IBM", name:"IBM", sector:"科技", industry:"IT服务", price:198.60, dividendYield:4.5, frequency:"quarterly", dividendPerShare:2.23, exDate:"2026-07-20", payDate:"2026-08-03", divGrowth1y:2.5, divGrowth3y:2.0, divGrowth5y:1.8, divYears:28, payoutRatio:0.75, marketCap:182*S, peRatio:16.5, market:"US", currency:"USD" },
  { ticker:"CVX", name:"雪佛龙", sector:"能源", industry:"油气综合", price:182.40, dividendYield:4.0, frequency:"quarterly", dividendPerShare:1.82, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:8.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:37, payoutRatio:0.42, marketCap:335*S, peRatio:10.8, market:"US", currency:"USD" },
  { ticker:"XOM", name:"埃克森美孚", sector:"能源", industry:"油气综合", price:128.50, dividendYield:3.4, frequency:"quarterly", dividendPerShare:1.09, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:4.8, divGrowth5y:3.5, divYears:40, payoutRatio:0.45, marketCap:560*S, peRatio:13.2, market:"US", currency:"USD" },
  { ticker:"DUK", name:"杜克能源", sector:"公用事业", industry:"电力", price:116.80, dividendYield:4.0, frequency:"quarterly", dividendPerShare:1.17, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:3.2, divGrowth3y:2.8, divGrowth5y:2.5, divYears:15, payoutRatio:0.72, marketCap:90*S, peRatio:18.5, market:"US", currency:"USD" },
  { ticker:"PRU", name:"保德信金融", sector:"金融", industry:"人寿保险", price:128.40, dividendYield:5.1, frequency:"quarterly", dividendPerShare:1.64, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:15, payoutRatio:0.48, marketCap:46*S, peRatio:9.5, market:"US", currency:"USD" },
  // ═══ Dividend Growth ═══
  { ticker:"AAPL", name:"苹果公司", sector:"科技", industry:"消费电子", price:238.50, dividendYield:2.6, frequency:"quarterly", dividendPerShare:1.55, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:15.2, divGrowth3y:12.5, divGrowth5y:10.8, divYears:13, payoutRatio:0.28, marketCap:3750*S, peRatio:34.2, market:"US", currency:"USD" },
  { ticker:"MSFT", name:"微软公司", sector:"科技", industry:"软件", price:468.20, dividendYield:1.9, frequency:"quarterly", dividendPerShare:2.22, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:18.5, divGrowth3y:15.2, divGrowth5y:12.5, divYears:18, payoutRatio:0.32, marketCap:3480*S, peRatio:36.8, market:"US", currency:"USD" },
  { ticker:"AVGO", name:"博通", sector:"科技", industry:"半导体", price:185.60, dividendYield:4.6, frequency:"quarterly", dividendPerShare:2.13, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:22.5, divGrowth3y:18.2, divGrowth5y:20.5, divYears:14, payoutRatio:0.55, marketCap:860*S, peRatio:35.5, market:"US", currency:"USD" },
  { ticker:"TXN", name:"德州仪器", sector:"科技", industry:"半导体", price:198.40, dividendYield:2.8, frequency:"quarterly", dividendPerShare:1.39, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:10.5, divGrowth3y:9.2, divGrowth5y:8.5, divYears:20, payoutRatio:0.55, marketCap:180*S, peRatio:27.5, market:"US", currency:"USD" },
  { ticker:"UNH", name:"联合健康", sector:"医疗健康", industry:"健康保险", price:578.50, dividendYield:1.6, frequency:"quarterly", dividendPerShare:2.31, exDate:"2026-07-15", payDate:"2026-07-29", divGrowth1y:18.2, divGrowth3y:16.5, divGrowth5y:15.8, divYears:14, payoutRatio:0.38, marketCap:530*S, peRatio:32.5, market:"US", currency:"USD" },
  { ticker:"V", name:"Visa", sector:"科技", industry:"支付处理", price:295.40, dividendYield:0.8, frequency:"quarterly", dividendPerShare:0.59, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:20.5, divGrowth3y:18.2, divGrowth5y:16.8, divYears:16, payoutRatio:0.22, marketCap:605*S, peRatio:32.8, market:"US", currency:"USD" },
  { ticker:"MA", name:"万事达", sector:"科技", industry:"支付处理", price:495.80, dividendYield:0.6, frequency:"quarterly", dividendPerShare:0.74, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:22.0, divGrowth3y:19.5, divGrowth5y:18.2, divYears:13, payoutRatio:0.20, marketCap:460*S, peRatio:38.5, market:"US", currency:"USD" },
  { ticker:"AMGN", name:"安进", sector:"医疗健康", industry:"生物技术", price:298.50, dividendYield:3.2, frequency:"quarterly", dividendPerShare:2.39, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:8.5, divGrowth3y:10.2, divGrowth5y:9.5, divYears:12, payoutRatio:0.48, marketCap:160*S, peRatio:15.2, market:"US", currency:"USD" },
  { ticker:"CSCO", name:"思科", sector:"科技", industry:"网络设备", price:56.80, dividendYield:3.1, frequency:"quarterly", dividendPerShare:0.44, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.52, marketCap:227*S, peRatio:17.2, market:"US", currency:"USD" },
  { ticker:"NEE", name:"新纪元能源", sector:"公用事业", industry:"可再生能源", price:78.50, dividendYield:3.8, frequency:"quarterly", dividendPerShare:0.75, exDate:"2026-07-20", payDate:"2026-08-03", divGrowth1y:12.5, divGrowth3y:10.8, divGrowth5y:9.5, divYears:12, payoutRatio:0.65, marketCap:160*S, peRatio:22.5, market:"US", currency:"USD" },
  { ticker:"SO", name:"南方公司", sector:"公用事业", industry:"电力", price:88.40, dividendYield:3.8, frequency:"quarterly", dividendPerShare:0.84, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:20, payoutRatio:0.75, marketCap:92*S, peRatio:20.8, market:"US", currency:"USD" },
  { ticker:"MET", name:"大都会人寿", sector:"金融", industry:"人寿保险", price:78.50, dividendYield:3.2, frequency:"quarterly", dividendPerShare:0.63, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:14, payoutRatio:0.44, marketCap:58*S, peRatio:13.5, market:"US", currency:"USD" },
  { ticker:"BX", name:"黑石集团", sector:"金融", industry:"资产管理", price:148.60, dividendYield:3.0, frequency:"quarterly", dividendPerShare:1.11, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:18.5, divGrowth3y:22.5, divGrowth5y:20.8, divYears:10, payoutRatio:0.60, marketCap:178*S, peRatio:35.8, market:"US", currency:"USD" },
  // ═══ Mid-Cap Dividend Growers ═══
  { ticker:"J", name:"杰克逊金融", sector:"金融", industry:"年金保险", price:98.50, dividendYield:2.8, frequency:"quarterly", dividendPerShare:0.69, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:15.5, divGrowth3y:12.8, divGrowth5y:10.5, divYears:5, payoutRatio:0.35, marketCap:25*S, peRatio:12.5, market:"US", currency:"USD" },
  { ticker:"FLO", name:"福劳尔食品", sector:"日常消费", industry:"烘焙", price:36.80, dividendYield:4.0, frequency:"quarterly", dividendPerShare:0.37, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.8, divYears:11, payoutRatio:0.75, marketCap:7.8*S, peRatio:18.5, market:"US", currency:"USD" },
  { ticker:"WPC", name:"W.P.凯里", sector:"房地产", industry:"REIT-净租赁", price:72.50, dividendYield:5.2, frequency:"quarterly", dividendPerShare:0.94, exDate:"2026-07-15", payDate:"2026-07-29", divGrowth1y:2.5, divGrowth3y:2.0, divGrowth5y:1.8, divYears:12, payoutRatio:0.82, marketCap:12.5*S, peRatio:35.2, market:"US", currency:"USD" },
  { ticker:"MAIN", name:"Main Street Capital", sector:"金融", industry:"BDC", price:52.80, dividendYield:5.8, frequency:"monthly", dividendPerShare:0.255, exDate:"2026-07-14", payDate:"2026-07-25", divGrowth1y:8.5, divGrowth3y:7.2, divGrowth5y:6.5, divYears:15, payoutRatio:0.72, marketCap:4.5*S, peRatio:14.8, market:"US", currency:"USD" },
  // ═══ Dividend ETFs ═══
  { ticker:"SCHD", name:"嘉信美国股息ETF", sector:"ETF", industry:"股息ETF", price:32.82, dividendYield:3.2, frequency:"quarterly", dividendPerShare:0.26, exDate:"2026-07-22", payDate:"2026-08-05", divGrowth1y:12.5, divGrowth3y:10.8, divGrowth5y:9.5, divYears:13, payoutRatio:0.55, marketCap:100*S, peRatio:17.3, market:"US", currency:"USD" },
  { ticker:"VYM", name:"先锋高股息收益ETF", sector:"ETF", industry:"股息ETF", price:128.50, dividendYield:3.0, frequency:"quarterly", dividendPerShare:0.96, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.60, marketCap:62*S, peRatio:16.5, market:"US", currency:"USD" },
  { ticker:"VIG", name:"先锋股息增长ETF", sector:"ETF", industry:"股息ETF", price:236.97, dividendYield:1.5, frequency:"quarterly", dividendPerShare:0.89, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:10.2, divGrowth3y:9.5, divGrowth5y:8.8, divYears:10, payoutRatio:0.40, marketCap:110*S, peRatio:24.9, market:"US", currency:"USD" },
  { ticker:"DGRO", name:"iShares核心股息增长ETF", sector:"ETF", industry:"股息ETF", price:68.50, dividendYield:2.3, frequency:"quarterly", dividendPerShare:0.39, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:7.2, divYears:10, payoutRatio:0.45, marketCap:28*S, peRatio:22.5, market:"US", currency:"USD" },
  { ticker:"SPYD", name:"SPDR投资组合高收益ETF", sector:"ETF", industry:"股息ETF", price:48.20, dividendYield:4.5, frequency:"quarterly", dividendPerShare:0.54, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:4.5, divGrowth3y:3.8, divGrowth5y:3.2, divYears:8, payoutRatio:0.70, marketCap:18*S, peRatio:12.5, market:"US", currency:"USD" },
  { ticker:"VOO", name:"先锋标普500ETF", sector:"ETF", industry:"大盘ETF", price:687.87, dividendYield:1.3, frequency:"quarterly", dividendPerShare:2.24, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:8.5, divGrowth3y:7.5, divGrowth5y:6.8, divYears:12, payoutRatio:0.35, marketCap:500*S, peRatio:26.5, market:"US", currency:"USD" },
  { ticker:"QQQ", name:"景顺QQQ ETF", sector:"ETF", industry:"科技ETF", price:518.60, dividendYield:0.6, frequency:"quarterly", dividendPerShare:0.78, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:12.5, divGrowth3y:15.2, divGrowth5y:14.8, divYears:10, payoutRatio:0.20, marketCap:300*S, peRatio:35.5, market:"US", currency:"USD" },
]

// ═══════════════════════════════════════════
// A股股息股票（145+只，涵盖银行/煤炭/公用事业/消费等）
// ═══════════════════════════════════════════
// 数据来源：证券时报、东方财富、21世纪经济报道 2026年4-7月
// 股息率基于2025年度分红方案及2026年7月股价

const cnStocks: StockSeed[] = [
  // ═══ 银行（21只）- 高股息、低估值 ═══
  { ticker:"601398", name:"工商银行", sector:"银行", industry:"国有大行", price:7.80, dividendYield:5.5, frequency:"annual", dividendPerShare:0.3103, exDate:"2026-07-10", payDate:"2026-07-25", divGrowth1y:3.5, divGrowth3y:3.0, divGrowth5y:2.8, divYears:20, payoutRatio:0.35, marketCap:2780*S, peRatio:7.2, market:"CN", currency:"CNY" },
  { ticker:"601939", name:"建设银行", sector:"银行", industry:"国有大行", price:8.20, dividendYield:5.4, frequency:"annual", dividendPerShare:0.443, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.2, divYears:18, payoutRatio:0.32, marketCap:2050*S, peRatio:7.0, market:"CN", currency:"CNY" },
  { ticker:"601288", name:"农业银行", sector:"银行", industry:"国有大行", price:5.10, dividendYield:5.6, frequency:"annual", dividendPerShare:0.2856, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:16, payoutRatio:0.33, marketCap:1785*S, peRatio:6.5, market:"CN", currency:"CNY" },
  { ticker:"601988", name:"中国银行", sector:"银行", industry:"国有大行", price:5.30, dividendYield:5.3, frequency:"annual", dividendPerShare:0.2809, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:3.8, divGrowth3y:3.2, divGrowth5y:3.0, divYears:16, payoutRatio:0.34, marketCap:1560*S, peRatio:6.8, market:"CN", currency:"CNY" },
  { ticker:"600036", name:"招商银行", sector:"银行", industry:"股份制银行", price:36.50, dividendYield:5.4, frequency:"annual", dividendPerShare:1.971, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:10.2, divYears:15, payoutRatio:0.35, marketCap:920*S, peRatio:6.5, market:"CN", currency:"CNY" },
  { ticker:"601166", name:"兴业银行", sector:"银行", industry:"股份制银行", price:17.73, dividendYield:5.9, frequency:"annual", dividendPerShare:1.046, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:14, payoutRatio:0.32, marketCap:368*S, peRatio:5.5, market:"CN", currency:"CNY" },
  { ticker:"601328", name:"交通银行", sector:"银行", industry:"国有大行", price:7.60, dividendYield:4.9, frequency:"annual", dividendPerShare:0.372, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.2, divYears:15, payoutRatio:0.32, marketCap:564*S, peRatio:6.2, market:"CN", currency:"CNY" },
  { ticker:"600000", name:"浦发银行", sector:"银行", industry:"股份制银行", price:9.20, dividendYield:5.2, frequency:"annual", dividendPerShare:0.478, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.35, marketCap:270*S, peRatio:6.0, market:"CN", currency:"CNY" },
  { ticker:"601998", name:"中信银行", sector:"银行", industry:"股份制银行", price:7.00, dividendYield:5.2, frequency:"annual", dividendPerShare:0.364, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:12, payoutRatio:0.32, marketCap:342*S, peRatio:5.8, market:"CN", currency:"CNY" },
  { ticker:"600016", name:"民生银行", sector:"银行", industry:"股份制银行", price:4.20, dividendYield:6.4, frequency:"annual", dividendPerShare:0.269, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:12, payoutRatio:0.30, marketCap:184*S, peRatio:5.2, market:"CN", currency:"CNY" },
  { ticker:"000001", name:"平安银行", sector:"银行", industry:"股份制银行", price:11.50, dividendYield:5.6, frequency:"annual", dividendPerShare:0.644, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:7.0, divGrowth3y:6.2, divGrowth5y:5.8, divYears:10, payoutRatio:0.32, marketCap:223*S, peRatio:5.5, market:"CN", currency:"CNY" },
  { ticker:"601818", name:"光大银行", sector:"银行", industry:"股份制银行", price:3.60, dividendYield:6.3, frequency:"annual", dividendPerShare:0.227, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:12, payoutRatio:0.35, marketCap:213*S, peRatio:5.0, market:"CN", currency:"CNY" },
  { ticker:"600015", name:"华夏银行", sector:"银行", industry:"股份制银行", price:6.74, dividendYield:6.2, frequency:"annual", dividendPerShare:0.418, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:11, payoutRatio:0.33, marketCap:107*S, peRatio:5.2, market:"CN", currency:"CNY" },
  { ticker:"601169", name:"北京银行", sector:"银行", industry:"城商行", price:6.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.330, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.33, marketCap:127*S, peRatio:5.8, market:"CN", currency:"CNY" },
  { ticker:"601229", name:"上海银行", sector:"银行", industry:"城商行", price:8.20, dividendYield:5.8, frequency:"annual", dividendPerShare:0.476, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.2, divYears:10, payoutRatio:0.34, marketCap:117*S, peRatio:5.5, market:"CN", currency:"CNY" },
  { ticker:"600919", name:"江苏银行", sector:"银行", industry:"城商行", price:8.50, dividendYield:5.0, frequency:"annual", dividendPerShare:0.425, exDate:"2026-07-15", payDate:"2026-07-29", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:10, payoutRatio:0.32, marketCap:155*S, peRatio:5.8, market:"CN", currency:"CNY" },
  { ticker:"002142", name:"宁波银行", sector:"银行", industry:"城商行", price:25.00, dividendYield:4.2, frequency:"annual", dividendPerShare:1.050, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:10.0, divGrowth3y:9.5, divGrowth5y:12.5, divYears:12, payoutRatio:0.35, marketCap:165*S, peRatio:7.5, market:"CN", currency:"CNY" },
  { ticker:"601009", name:"南京银行", sector:"银行", industry:"城商行", price:11.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.495, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:10, payoutRatio:0.35, marketCap:113*S, peRatio:6.5, market:"CN", currency:"CNY" },
  { ticker:"601838", name:"成都银行", sector:"银行", industry:"城商行", price:16.00, dividendYield:5.7, frequency:"annual", dividendPerShare:0.912, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:9.0, divGrowth3y:8.5, divGrowth5y:8.0, divYears:8, payoutRatio:0.33, marketCap:61*S, peRatio:5.2, market:"CN", currency:"CNY" },
  { ticker:"601577", name:"长沙银行", sector:"银行", industry:"城商行", price:9.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.450, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:8, payoutRatio:0.34, marketCap:37*S, peRatio:5.6, market:"CN", currency:"CNY" },

  // ═══ 保险（5只）═══
  { ticker:"601318", name:"中国平安", sector:"金融", industry:"保险", price:52.00, dividendYield:4.5, frequency:"annual", dividendPerShare:2.340, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:8.5, divGrowth3y:7.5, divGrowth5y:10.2, divYears:12, payoutRatio:0.32, marketCap:950*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601628", name:"中国人寿", sector:"金融", industry:"保险", price:35.00, dividendYield:2.5, frequency:"annual", dividendPerShare:0.875, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.35, marketCap:990*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"601601", name:"中国太保", sector:"金融", industry:"保险", price:32.00, dividendYield:3.2, frequency:"annual", dividendPerShare:1.024, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:12, payoutRatio:0.35, marketCap:308*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"601336", name:"新华保险", sector:"金融", industry:"保险", price:35.00, dividendYield:2.8, frequency:"annual", dividendPerShare:0.980, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.0, divGrowth3y:6.2, divGrowth5y:5.8, divYears:10, payoutRatio:0.33, marketCap:109*S, peRatio:5.8, market:"CN", currency:"CNY" },
  { ticker:"601319", name:"中国人保", sector:"金融", industry:"保险", price:6.50, dividendYield:3.0, frequency:"annual", dividendPerShare:0.195, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:8, payoutRatio:0.35, marketCap:287*S, peRatio:12.0, market:"CN", currency:"CNY" },

  // ═══ 白酒（6只）═══
  { ticker:"600519", name:"贵州茅台", sector:"日常消费", industry:"白酒", price:1480.00, dividendYield:2.0, frequency:"annual", dividendPerShare:29.60, exDate:"2026-06-30", payDate:"2026-07-15", divGrowth1y:12.5, divGrowth3y:15.2, divGrowth5y:18.5, divYears:22, payoutRatio:0.43, marketCap:1859*S, peRatio:25.5, market:"CN", currency:"CNY" },
  { ticker:"000858", name:"五粮液", sector:"日常消费", industry:"白酒", price:145.00, dividendYield:3.5, frequency:"annual", dividendPerShare:5.075, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:10.0, divGrowth3y:12.5, divGrowth5y:14.8, divYears:15, payoutRatio:0.50, marketCap:563*S, peRatio:16.5, market:"CN", currency:"CNY" },
  { ticker:"000568", name:"泸州老窖", sector:"日常消费", industry:"白酒", price:145.00, dividendYield:3.2, frequency:"annual", dividendPerShare:4.640, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:12.0, divGrowth3y:15.5, divGrowth5y:18.2, divYears:14, payoutRatio:0.52, marketCap:213*S, peRatio:16.8, market:"CN", currency:"CNY" },
  { ticker:"002304", name:"洋河股份", sector:"日常消费", industry:"白酒", price:92.00, dividendYield:4.5, frequency:"annual", dividendPerShare:4.140, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:8.0, divGrowth3y:9.5, divGrowth5y:10.2, divYears:12, payoutRatio:0.60, marketCap:139*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"600809", name:"山西汾酒", sector:"日常消费", industry:"白酒", price:210.00, dividendYield:2.0, frequency:"annual", dividendPerShare:4.200, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:15.0, divGrowth3y:18.5, divGrowth5y:22.5, divYears:10, payoutRatio:0.45, marketCap:256*S, peRatio:22.5, market:"CN", currency:"CNY" },
  { ticker:"000596", name:"古井贡酒", sector:"日常消费", industry:"白酒", price:195.00, dividendYield:2.5, frequency:"annual", dividendPerShare:4.875, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:10.0, divGrowth3y:12.5, divGrowth5y:14.0, divYears:10, payoutRatio:0.48, marketCap:103*S, peRatio:20.5, market:"CN", currency:"CNY" },

  // ═══ 煤炭（7只）═══
  { ticker:"601088", name:"中国神华", sector:"能源", industry:"煤炭", price:42.00, dividendYield:6.8, frequency:"annual", dividendPerShare:2.856, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.5, divGrowth3y:7.2, divGrowth5y:10.5, divYears:18, payoutRatio:0.78, marketCap:835*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"601225", name:"陕西煤业", sector:"能源", industry:"煤炭", price:25.00, dividendYield:7.0, frequency:"annual", dividendPerShare:1.750, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:12.0, divGrowth3y:10.5, divGrowth5y:8.5, divYears:15, payoutRatio:0.65, marketCap:242*S, peRatio:9.8, market:"CN", currency:"CNY" },
  { ticker:"600188", name:"兖矿能源", sector:"能源", industry:"煤炭", price:18.00, dividendYield:12.5, frequency:"annual", dividendPerShare:2.250, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:15.5, divGrowth3y:18.2, divGrowth5y:20.5, divYears:12, payoutRatio:0.70, marketCap:134*S, peRatio:8.5, market:"CN", currency:"CNY" },
  { ticker:"601898", name:"中煤能源", sector:"能源", industry:"煤炭", price:12.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.540, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.35, marketCap:159*S, peRatio:10.2, market:"CN", currency:"CNY" },
  { ticker:"601699", name:"潞安环能", sector:"能源", industry:"煤炭", price:18.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.990, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.0, divGrowth3y:7.2, divGrowth5y:6.5, divYears:10, payoutRatio:0.45, marketCap:54*S, peRatio:8.8, market:"CN", currency:"CNY" },
  { ticker:"000983", name:"山西焦煤", sector:"能源", industry:"煤炭", price:12.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.600, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:10, payoutRatio:0.40, marketCap:68*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"600575", name:"淮河能源", sector:"能源", industry:"煤炭", price:3.50, dividendYield:5.6, frequency:"annual", dividendPerShare:0.196, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:8, payoutRatio:0.40, marketCap:14*S, peRatio:10.5, market:"CN", currency:"CNY" },

  // ═══ 石油石化（5只）═══
  { ticker:"601857", name:"中国石油", sector:"能源", industry:"石油天然气", price:9.50, dividendYield:5.0, frequency:"annual", dividendPerShare:0.475, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:20, payoutRatio:0.50, marketCap:1739*S, peRatio:10.2, market:"CN", currency:"CNY" },
  { ticker:"600028", name:"中国石化", sector:"能源", industry:"石油天然气", price:7.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.385, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:20, payoutRatio:0.70, marketCap:840*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600938", name:"中国海油", sector:"能源", industry:"石油天然气", price:32.00, dividendYield:5.3, frequency:"annual", dividendPerShare:1.696, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:10.5, divGrowth3y:12.0, divGrowth5y:15.5, divYears:8, payoutRatio:0.50, marketCap:1520*S, peRatio:9.8, market:"CN", currency:"CNY" },
  { ticker:"600256", name:"广汇能源", sector:"能源", industry:"石油天然气", price:6.50, dividendYield:12.5, frequency:"annual", dividendPerShare:0.813, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:15.0, divGrowth3y:18.5, divGrowth5y:20.0, divYears:8, payoutRatio:0.85, marketCap:43*S, peRatio:6.5, market:"CN", currency:"CNY" },
  { ticker:"600803", name:"新奥股份", sector:"能源", industry:"天然气", price:18.00, dividendYield:3.0, frequency:"annual", dividendPerShare:0.540, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.35, marketCap:56*S, peRatio:12.5, market:"CN", currency:"CNY" },

  // ═══ 电力/公用事业（12只）═══
  { ticker:"600900", name:"长江电力", sector:"公用事业", industry:"水力发电", price:28.00, dividendYield:5.2, frequency:"annual", dividendPerShare:1.456, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:15, payoutRatio:0.72, marketCap:685*S, peRatio:13.8, market:"CN", currency:"CNY" },
  { ticker:"600011", name:"华能国际", sector:"公用事业", industry:"火力发电", price:8.50, dividendYield:3.5, frequency:"annual", dividendPerShare:0.298, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:4.8, divGrowth5y:4.2, divYears:12, payoutRatio:0.45, marketCap:133*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600795", name:"国电电力", sector:"公用事业", industry:"火力发电", price:5.00, dividendYield:3.0, frequency:"annual", dividendPerShare:0.150, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:10, payoutRatio:0.40, marketCap:89*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"600023", name:"浙能电力", sector:"公用事业", industry:"火力发电", price:5.00, dividendYield:5.7, frequency:"annual", dividendPerShare:0.285, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:10, payoutRatio:0.50, marketCap:67*S, peRatio:8.8, market:"CN", currency:"CNY" },
  { ticker:"600642", name:"申能股份", sector:"公用事业", industry:"综合电力", price:7.80, dividendYield:5.9, frequency:"annual", dividendPerShare:0.460, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:12, payoutRatio:0.55, marketCap:38*S, peRatio:9.2, market:"CN", currency:"CNY" },
  { ticker:"600027", name:"华电国际", sector:"公用事业", industry:"火力发电", price:6.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.210, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:10, payoutRatio:0.42, marketCap:61*S, peRatio:11.8, market:"CN", currency:"CNY" },
  { ticker:"600886", name:"国投电力", sector:"公用事业", industry:"水力发电", price:16.00, dividendYield:2.5, frequency:"annual", dividendPerShare:0.400, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:12, payoutRatio:0.42, marketCap:119*S, peRatio:16.5, market:"CN", currency:"CNY" },
  { ticker:"600674", name:"川投能源", sector:"公用事业", industry:"水力发电", price:18.00, dividendYield:2.0, frequency:"annual", dividendPerShare:0.360, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:12, payoutRatio:0.38, marketCap:88*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"600025", name:"华能水电", sector:"公用事业", industry:"水力发电", price:11.00, dividendYield:2.5, frequency:"annual", dividendPerShare:0.275, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:8, payoutRatio:0.35, marketCap:198*S, peRatio:18.0, market:"CN", currency:"CNY" },
  { ticker:"605368", name:"蓝天燃气", sector:"公用事业", industry:"燃气", price:12.00, dividendYield:6.1, frequency:"annual", dividendPerShare:0.732, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:5, payoutRatio:0.55, marketCap:6.5*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"603393", name:"新天然气", sector:"公用事业", industry:"燃气", price:32.00, dividendYield:4.0, frequency:"annual", dividendPerShare:1.280, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:6, payoutRatio:0.45, marketCap:14*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"603689", name:"皖天然气", sector:"公用事业", industry:"燃气", price:12.00, dividendYield:4.8, frequency:"annual", dividendPerShare:0.576, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:5, payoutRatio:0.50, marketCap:4*S, peRatio:11.5, market:"CN", currency:"CNY" },

  // ═══ 交通运输（10只）═══
  { ticker:"601006", name:"大秦铁路", sector:"交通运输", industry:"铁路运输", price:7.00, dividendYield:5.8, frequency:"annual", dividendPerShare:0.406, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:15, payoutRatio:0.62, marketCap:127*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600377", name:"宁沪高速", sector:"交通运输", industry:"高速公路", price:14.00, dividendYield:7.5, frequency:"annual", dividendPerShare:1.050, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.77, marketCap:70*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600548", name:"深高速", sector:"交通运输", industry:"高速公路", price:11.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.550, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:12, payoutRatio:0.55, marketCap:24*S, peRatio:10.8, market:"CN", currency:"CNY" },
  { ticker:"000429", name:"粤高速A", sector:"交通运输", industry:"高速公路", price:10.00, dividendYield:5.1, frequency:"annual", dividendPerShare:0.510, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:12, payoutRatio:0.60, marketCap:21*S, peRatio:11.2, market:"CN", currency:"CNY" },
  { ticker:"600350", name:"山东高速", sector:"交通运输", industry:"高速公路", price:9.00, dividendYield:6.0, frequency:"annual", dividendPerShare:0.540, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:12, payoutRatio:0.65, marketCap:43*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601000", name:"唐山港", sector:"交通运输", industry:"港口", price:4.50, dividendYield:5.2, frequency:"annual", dividendPerShare:0.234, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:10, payoutRatio:0.55, marketCap:27*S, peRatio:10.8, market:"CN", currency:"CNY" },
  { ticker:"601298", name:"青岛港", sector:"交通运输", industry:"港口", price:8.50, dividendYield:3.8, frequency:"annual", dividendPerShare:0.323, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:8, payoutRatio:0.45, marketCap:55*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601083", name:"锦江航运", sector:"交通运输", industry:"航运", price:11.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.605, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:5, payoutRatio:0.50, marketCap:12*S, peRatio:8.5, market:"CN", currency:"CNY" },
  { ticker:"600269", name:"赣粤高速", sector:"交通运输", industry:"高速公路", price:5.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.225, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:10, payoutRatio:0.50, marketCap:12*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"601919", name:"中远海控", sector:"交通运输", industry:"航运", price:14.00, dividendYield:12.9, frequency:"annual", dividendPerShare:1.806, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:15.0, divGrowth3y:18.5, divGrowth5y:22.0, divYears:8, payoutRatio:0.70, marketCap:224*S, peRatio:5.5, market:"CN", currency:"CNY" },

  // ═══ 钢铁（5只）═══
  { ticker:"600019", name:"宝钢股份", sector:"材料", industry:"钢铁", price:7.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.315, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.52, marketCap:155*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"000898", name:"鞍钢股份", sector:"材料", industry:"钢铁", price:2.80, dividendYield:5.0, frequency:"annual", dividendPerShare:0.140, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:12, payoutRatio:0.40, marketCap:26*S, peRatio:8.5, market:"CN", currency:"CNY" },
  { ticker:"600295", name:"鄂尔多斯", sector:"材料", industry:"钢铁", price:12.00, dividendYield:5.7, frequency:"annual", dividendPerShare:0.684, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.55, marketCap:34*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"600282", name:"南钢股份", sector:"材料", industry:"钢铁", price:4.50, dividendYield:4.0, frequency:"annual", dividendPerShare:0.180, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:10, payoutRatio:0.45, marketCap:28*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"000708", name:"中信特钢", sector:"材料", industry:"钢铁", price:15.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.675, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:7.0, divGrowth3y:6.2, divGrowth5y:5.8, divYears:10, payoutRatio:0.48, marketCap:76*S, peRatio:13.5, market:"CN", currency:"CNY" },

  // ═══ 水泥/建材（5只）═══
  { ticker:"600585", name:"海螺水泥", sector:"材料", industry:"水泥", price:25.00, dividendYield:5.0, frequency:"annual", dividendPerShare:1.250, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:15, payoutRatio:0.52, marketCap:132*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"002233", name:"塔牌集团", sector:"材料", industry:"水泥", price:8.00, dividendYield:8.1, frequency:"annual", dividendPerShare:0.648, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:10, payoutRatio:0.97, marketCap:10*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"000401", name:"冀东水泥", sector:"材料", industry:"水泥", price:6.50, dividendYield:3.0, frequency:"annual", dividendPerShare:0.195, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:3.5, divGrowth3y:3.0, divGrowth5y:2.5, divYears:8, payoutRatio:0.40, marketCap:17*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"600801", name:"华新水泥", sector:"材料", industry:"水泥", price:15.00, dividendYield:4.0, frequency:"annual", dividendPerShare:0.600, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.45, marketCap:31*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"002572", name:"索菲亚", sector:"轻工制造", industry:"家居用品", price:13.60, dividendYield:5.9, frequency:"annual", dividendPerShare:0.802, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:8, payoutRatio:0.65, marketCap:12*S, peRatio:12.5, market:"CN", currency:"CNY" },

  // ═══ 消费品（10只）═══
  { ticker:"600887", name:"伊利股份", sector:"日常消费", industry:"乳制品", price:28.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.980, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:7.2, divYears:15, payoutRatio:0.70, marketCap:178*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"000895", name:"双汇发展", sector:"日常消费", industry:"肉制品", price:26.00, dividendYield:5.0, frequency:"annual", dividendPerShare:1.300, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:12, payoutRatio:0.82, marketCap:90*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"603288", name:"海天味业", sector:"日常消费", industry:"调味品", price:38.00, dividendYield:2.5, frequency:"annual", dividendPerShare:0.950, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:10.2, divYears:10, payoutRatio:0.55, marketCap:211*S, peRatio:22.5, market:"CN", currency:"CNY" },
  { ticker:"000848", name:"承德露露", sector:"日常消费", industry:"软饮料", price:8.50, dividendYield:5.9, frequency:"annual", dividendPerShare:0.502, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.75, marketCap:9*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"002557", name:"洽洽食品", sector:"日常消费", industry:"零食", price:34.00, dividendYield:3.0, frequency:"annual", dividendPerShare:1.020, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:9.0, divGrowth3y:8.5, divGrowth5y:8.0, divYears:8, payoutRatio:0.55, marketCap:17*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"603156", name:"养元饮品", sector:"日常消费", industry:"软饮料", price:22.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.990, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:8, payoutRatio:0.70, marketCap:28*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"002582", name:"好想你", sector:"日常消费", industry:"零食", price:11.00, dividendYield:5.4, frequency:"annual", dividendPerShare:0.594, exDate:"2026-07-18", payDate:"2026-08-01", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:6, payoutRatio:0.65, marketCap:5*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600873", name:"梅花生物", sector:"日常消费", industry:"调味品", price:11.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.605, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:8, payoutRatio:0.55, marketCap:32*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"603165", name:"荣晟环保", sector:"轻工制造", industry:"造纸", price:12.60, dividendYield:8.7, frequency:"annual", dividendPerShare:1.096, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:10.0, divGrowth3y:9.5, divGrowth5y:9.0, divYears:5, payoutRatio:0.85, marketCap:3.8*S, peRatio:8.5, market:"CN", currency:"CNY" },

  // ═══ 家电（6只）═══
  { ticker:"000333", name:"美的集团", sector:"非日常消费", industry:"家电", price:65.00, dividendYield:4.0, frequency:"annual", dividendPerShare:2.600, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:10.5, divGrowth3y:9.8, divGrowth5y:12.2, divYears:12, payoutRatio:0.65, marketCap:455*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"000651", name:"格力电器", sector:"非日常消费", industry:"家电", price:42.00, dividendYield:5.5, frequency:"annual", dividendPerShare:2.310, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:8.5, divYears:15, payoutRatio:0.55, marketCap:236*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"600690", name:"海尔智家", sector:"非日常消费", industry:"家电", price:28.00, dividendYield:3.0, frequency:"annual", dividendPerShare:0.840, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:10.5, divYears:12, payoutRatio:0.42, marketCap:264*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"002032", name:"苏泊尔", sector:"非日常消费", industry:"家电", price:44.00, dividendYield:6.0, frequency:"annual", dividendPerShare:2.640, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:9.0, divGrowth3y:8.5, divGrowth5y:8.0, divYears:10, payoutRatio:0.70, marketCap:35*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"000921", name:"海信家电", sector:"非日常消费", industry:"家电", price:32.00, dividendYield:3.5, frequency:"annual", dividendPerShare:1.120, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:10.0, divGrowth3y:9.5, divGrowth5y:9.0, divYears:8, payoutRatio:0.42, marketCap:44*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600983", name:"惠而浦", sector:"非日常消费", industry:"家电", price:9.50, dividendYield:7.0, frequency:"annual", dividendPerShare:0.665, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:6, payoutRatio:0.75, marketCap:7*S, peRatio:12.5, market:"CN", currency:"CNY" },

  // ═══ 医药（8只）═══
  { ticker:"600329", name:"达仁堂", sector:"医疗健康", industry:"中药", price:22.00, dividendYield:5.1, frequency:"annual", dividendPerShare:1.122, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:7.2, divYears:10, payoutRatio:0.85, marketCap:17*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"600566", name:"济川药业", sector:"医疗健康", industry:"中药", price:26.00, dividendYield:6.6, frequency:"annual", dividendPerShare:1.716, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:9.0, divGrowth3y:8.5, divGrowth5y:8.0, divYears:8, payoutRatio:0.65, marketCap:24*S, peRatio:13.5, market:"CN", currency:"CNY" },
  { ticker:"000915", name:"华特达因", sector:"医疗健康", industry:"化学制药", price:33.00, dividendYield:6.1, frequency:"annual", dividendPerShare:2.013, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:7.5, divGrowth3y:7.0, divGrowth5y:6.5, divYears:8, payoutRatio:0.72, marketCap:8*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600285", name:"羚锐制药", sector:"医疗健康", industry:"中药", price:24.00, dividendYield:5.3, frequency:"annual", dividendPerShare:1.272, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:8, payoutRatio:0.62, marketCap:14*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"000423", name:"东阿阿胶", sector:"医疗健康", industry:"中药", price:52.00, dividendYield:3.5, frequency:"annual", dividendPerShare:1.820, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:10.5, divGrowth3y:12.0, divGrowth5y:15.5, divYears:12, payoutRatio:0.42, marketCap:34*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"600750", name:"江中药业", sector:"医疗健康", industry:"中药", price:22.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.990, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.55, marketCap:14*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"002737", name:"葵花药业", sector:"医疗健康", industry:"中药", price:28.00, dividendYield:4.0, frequency:"annual", dividendPerShare:1.120, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:8, payoutRatio:0.50, marketCap:16*S, peRatio:13.5, market:"CN", currency:"CNY" },
  { ticker:"000538", name:"云南白药", sector:"医疗健康", industry:"中药", price:55.00, dividendYield:3.0, frequency:"annual", dividendPerShare:1.650, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:15, payoutRatio:0.45, marketCap:98*S, peRatio:18.5, market:"CN", currency:"CNY" },

  // ═══ 汽车（5只）═══
  { ticker:"600104", name:"上汽集团", sector:"非日常消费", industry:"汽车", price:15.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.525, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.35, marketCap:174*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600066", name:"宇通客车", sector:"非日常消费", industry:"客车", price:30.00, dividendYield:6.1, frequency:"annual", dividendPerShare:1.830, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:12.5, divGrowth3y:15.2, divGrowth5y:18.5, divYears:12, payoutRatio:0.65, marketCap:66*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600660", name:"福耀玻璃", sector:"非日常消费", industry:"汽车零部件", price:55.00, dividendYield:3.0, frequency:"annual", dividendPerShare:1.650, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:8.5, divGrowth3y:9.5, divGrowth5y:11.2, divYears:15, payoutRatio:0.62, marketCap:144*S, peRatio:18.5, market:"CN", currency:"CNY" },
  { ticker:"000338", name:"潍柴动力", sector:"非日常消费", industry:"汽车零部件", price:16.00, dividendYield:4.0, frequency:"annual", dividendPerShare:0.640, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:6.2, divYears:12, payoutRatio:0.48, marketCap:140*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"601238", name:"广汽集团", sector:"非日常消费", industry:"汽车", price:9.00, dividendYield:3.0, frequency:"annual", dividendPerShare:0.270, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:10, payoutRatio:0.40, marketCap:94*S, peRatio:14.5, market:"CN", currency:"CNY" },

  // ═══ 纺织服饰（5只）═══
  { ticker:"600398", name:"海澜之家", sector:"非日常消费", industry:"服装", price:6.00, dividendYield:6.8, frequency:"annual", dividendPerShare:0.408, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:10, payoutRatio:0.72, marketCap:26*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"002763", name:"汇洁股份", sector:"非日常消费", industry:"服装", price:7.20, dividendYield:11.1, frequency:"annual", dividendPerShare:0.799, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:8.5, divGrowth3y:8.0, divGrowth5y:7.5, divYears:5, payoutRatio:0.85, marketCap:3*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"002327", name:"富安娜", sector:"非日常消费", industry:"家纺", price:6.80, dividendYield:5.7, frequency:"annual", dividendPerShare:0.388, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:10, payoutRatio:0.75, marketCap:6*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"002612", name:"朗姿股份", sector:"非日常消费", industry:"服装", price:20.00, dividendYield:5.9, frequency:"annual", dividendPerShare:1.180, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:5, payoutRatio:0.65, marketCap:9*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"002867", name:"周大生", sector:"非日常消费", industry:"珠宝", price:15.00, dividendYield:5.3, frequency:"annual", dividendPerShare:0.795, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:8, payoutRatio:0.55, marketCap:16*S, peRatio:12.5, market:"CN", currency:"CNY" },

  // ═══ 建筑/房地产（6只）═══
  { ticker:"601668", name:"中国建筑", sector:"建筑", industry:"房屋建设", price:6.00, dividendYield:5.3, frequency:"annual", dividendPerShare:0.318, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:12, payoutRatio:0.25, marketCap:251*S, peRatio:4.8, market:"CN", currency:"CNY" },
  { ticker:"601390", name:"中国中铁", sector:"建筑", industry:"基建工程", price:7.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.245, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:12, payoutRatio:0.28, marketCap:173*S, peRatio:5.5, market:"CN", currency:"CNY" },
  { ticker:"601186", name:"中国铁建", sector:"建筑", industry:"基建工程", price:9.50, dividendYield:3.5, frequency:"annual", dividendPerShare:0.333, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:12, payoutRatio:0.25, marketCap:129*S, peRatio:5.2, market:"CN", currency:"CNY" },
  { ticker:"600007", name:"中国国贸", sector:"房地产", industry:"商业地产", price:20.00, dividendYield:5.4, frequency:"annual", dividendPerShare:1.080, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.65, marketCap:20*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600048", name:"保利发展", sector:"房地产", industry:"住宅开发", price:10.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.450, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:10, payoutRatio:0.35, marketCap:120*S, peRatio:7.5, market:"CN", currency:"CNY" },
  { ticker:"000002", name:"万科A", sector:"房地产", industry:"住宅开发", price:8.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.400, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:8.2, divYears:15, payoutRatio:0.40, marketCap:95*S, peRatio:8.5, market:"CN", currency:"CNY" },

  // ═══ 机械/设备（5只）═══
  { ticker:"600582", name:"天地科技", sector:"工业", industry:"矿山机械", price:8.00, dividendYield:5.2, frequency:"annual", dividendPerShare:0.416, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:10, payoutRatio:0.55, marketCap:33*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"002884", name:"凌霄泵业", sector:"工业", industry:"泵", price:17.70, dividendYield:5.7, frequency:"annual", dividendPerShare:1.009, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:8, payoutRatio:0.65, marketCap:4*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"603855", name:"华荣股份", sector:"工业", industry:"防爆电器", price:18.00, dividendYield:5.2, frequency:"annual", dividendPerShare:0.936, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:6, payoutRatio:0.60, marketCap:6*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"600761", name:"安徽合力", sector:"工业", industry:"叉车", price:22.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.770, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:7.2, divYears:10, payoutRatio:0.45, marketCap:16*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"601567", name:"三星医疗", sector:"工业", industry:"智能电表", price:30.00, dividendYield:2.0, frequency:"annual", dividendPerShare:0.600, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:10.0, divGrowth3y:12.5, divGrowth5y:15.0, divYears:8, payoutRatio:0.35, marketCap:42*S, peRatio:22.5, market:"CN", currency:"CNY" },

  // ═══ 零售/商业（4只）═══
  { ticker:"600694", name:"大商股份", sector:"非日常消费", industry:"百货", price:18.00, dividendYield:5.6, frequency:"annual", dividendPerShare:1.008, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:12, payoutRatio:0.62, marketCap:5*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"002818", name:"富森美", sector:"非日常消费", industry:"家居卖场", price:14.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.700, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:8, payoutRatio:0.92, marketCap:10*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"600861", name:"北京人力", sector:"社会服务", industry:"人力资源", price:18.00, dividendYield:5.6, frequency:"annual", dividendPerShare:1.008, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:6, payoutRatio:0.55, marketCap:10*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600153", name:"建发股份", sector:"交通运输", industry:"供应链", price:9.00, dividendYield:5.4, frequency:"annual", dividendPerShare:0.486, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:10, payoutRatio:0.50, marketCap:28*S, peRatio:8.5, market:"CN", currency:"CNY" },

  // ═══ 信息技术/游戏（4只）═══
  { ticker:"603444", name:"吉比特", sector:"科技", industry:"游戏", price:210.00, dividendYield:5.0, frequency:"annual", dividendPerShare:10.500, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.5, divGrowth3y:7.8, divGrowth5y:10.5, divYears:8, payoutRatio:0.55, marketCap:15*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"300033", name:"同花顺", sector:"科技", industry:"金融科技", price:150.00, dividendYield:2.0, frequency:"annual", dividendPerShare:3.000, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:12.0, divGrowth3y:15.5, divGrowth5y:18.0, divYears:8, payoutRatio:0.86, marketCap:81*S, peRatio:25.5, market:"CN", currency:"CNY" },
  { ticker:"002555", name:"三七互娱", sector:"科技", industry:"游戏", price:18.00, dividendYield:5.0, frequency:"semi-annual", dividendPerShare:0.900, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:10.5, divGrowth3y:12.0, divGrowth5y:15.5, divYears:6, payoutRatio:0.55, marketCap:40*S, peRatio:12.5, market:"CN", currency:"CNY" },

  // ═══ 电信运营（2只）═══
  { ticker:"600941", name:"中国移动", sector:"电信", industry:"电信运营", price:110.00, dividendYield:7.8, frequency:"annual", dividendPerShare:8.580, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:10.5, divGrowth3y:9.8, divGrowth5y:9.2, divYears:10, payoutRatio:0.72, marketCap:2250*S, peRatio:12.8, market:"CN", currency:"CNY" },
  { ticker:"601728", name:"中国电信", sector:"电信", industry:"电信运营", price:6.50, dividendYield:5.5, frequency:"annual", dividendPerShare:0.358, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:8, payoutRatio:0.70, marketCap:595*S, peRatio:15.5, market:"CN", currency:"CNY" },

  // ═══ 媒体/出版（3只）═══
  { ticker:"000719", name:"中原传媒", sector:"传媒", industry:"出版", price:12.00, dividendYield:5.6, frequency:"annual", dividendPerShare:0.672, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:8, payoutRatio:0.55, marketCap:12*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601098", name:"中南传媒", sector:"传媒", industry:"出版", price:12.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.600, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:10, payoutRatio:0.55, marketCap:22*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"600757", name:"长江传媒", sector:"传媒", industry:"出版", price:9.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.405, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:4.5, divGrowth3y:4.0, divGrowth5y:3.5, divYears:8, payoutRatio:0.50, marketCap:11*S, peRatio:11.5, market:"CN", currency:"CNY" },

  // ═══ 化工/材料（4只）═══
  { ticker:"601216", name:"君正集团", sector:"基础化工", industry:"氯碱化工", price:4.80, dividendYield:7.9, frequency:"annual", dividendPerShare:0.379, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:8.0, divGrowth3y:7.5, divGrowth5y:7.0, divYears:8, payoutRatio:0.70, marketCap:40*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"600866", name:"星湖科技", sector:"基础化工", industry:"食品添加剂", price:7.00, dividendYield:5.5, frequency:"annual", dividendPerShare:0.385, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:6, payoutRatio:0.55, marketCap:12*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600309", name:"万华化学", sector:"基础化工", industry:"聚氨酯", price:85.00, dividendYield:2.5, frequency:"annual", dividendPerShare:2.125, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:7.5, divGrowth3y:6.8, divGrowth5y:10.2, divYears:12, payoutRatio:0.35, marketCap:267*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"000830", name:"鲁西化工", sector:"基础化工", industry:"化肥", price:12.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.540, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:6.5, divGrowth3y:5.8, divGrowth5y:5.2, divYears:8, payoutRatio:0.45, marketCap:23*S, peRatio:9.5, market:"CN", currency:"CNY" },

  // ═══ 环保/水务（4只）═══
  { ticker:"601158", name:"重庆水务", sector:"公用事业", industry:"水务", price:5.50, dividendYield:3.5, frequency:"annual", dividendPerShare:0.193, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:10, payoutRatio:0.52, marketCap:26*S, peRatio:15.5, market:"CN", currency:"CNY" },
  { ticker:"600008", name:"首创环保", sector:"公用事业", industry:"水务", price:3.00, dividendYield:3.0, frequency:"annual", dividendPerShare:0.090, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:3.5, divGrowth3y:3.0, divGrowth5y:2.5, divYears:10, payoutRatio:0.42, marketCap:22*S, peRatio:14.5, market:"CN", currency:"CNY" },
  { ticker:"600461", name:"洪城环境", sector:"公用事业", industry:"水务", price:10.00, dividendYield:3.5, frequency:"annual", dividendPerShare:0.350, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:8, payoutRatio:0.45, marketCap:11*S, peRatio:13.5, market:"CN", currency:"CNY" },
  { ticker:"603568", name:"伟明环保", sector:"公用事业", industry:"固废处理", price:20.00, dividendYield:2.0, frequency:"annual", dividendPerShare:0.400, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:7.5, divGrowth3y:8.5, divGrowth5y:10.0, divYears:6, payoutRatio:0.30, marketCap:34*S, peRatio:18.5, market:"CN", currency:"CNY" },

  // ═══ 军工/航天（2只）═══
  { ticker:"600760", name:"中航沈飞", sector:"国防军工", industry:"飞机制造", price:42.00, dividendYield:1.5, frequency:"annual", dividendPerShare:0.630, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:10.0, divGrowth3y:12.5, divGrowth5y:15.0, divYears:8, payoutRatio:0.35, marketCap:82*S, peRatio:25.5, market:"CN", currency:"CNY" },
  { ticker:"600893", name:"航发动力", sector:"国防军工", industry:"航空发动机", price:38.00, dividendYield:1.2, frequency:"annual", dividendPerShare:0.456, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:8.0, divGrowth3y:10.5, divGrowth5y:12.0, divYears:8, payoutRatio:0.35, marketCap:101*S, peRatio:30.5, market:"CN", currency:"CNY" },

  // ═══ 更多高股息标的（10只）═══
  { ticker:"603519", name:"立霸股份", sector:"家用电器", industry:"家电零部件", price:12.00, dividendYield:8.3, frequency:"annual", dividendPerShare:0.996, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:5, payoutRatio:0.85, marketCap:3.2*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600479", name:"千金药业", sector:"医疗健康", industry:"中药", price:12.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.540, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:8, payoutRatio:0.55, marketCap:5*S, peRatio:13.5, market:"CN", currency:"CNY" },
  { ticker:"600377", name:"宁沪高速", sector:"交通运输", industry:"高速公路", price:14.00, dividendYield:7.5, frequency:"annual", dividendPerShare:1.050, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.77, marketCap:70*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"603368", name:"柳药集团", sector:"医疗健康", industry:"医药流通", price:18.00, dividendYield:4.0, frequency:"annual", dividendPerShare:0.720, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:7.0, divGrowth3y:6.5, divGrowth5y:6.0, divYears:6, payoutRatio:0.45, marketCap:7*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601515", name:"东风股份", sector:"轻工制造", industry:"包装印刷", price:8.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.400, exDate:"2026-07-16", payDate:"2026-07-30", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:8, payoutRatio:0.55, marketCap:15*S, peRatio:12.5, market:"CN", currency:"CNY" },
  { ticker:"000900", name:"现代投资", sector:"交通运输", industry:"高速公路", price:5.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.250, exDate:"2026-07-08", payDate:"2026-07-22", divGrowth1y:4.0, divGrowth3y:3.5, divGrowth5y:3.0, divYears:10, payoutRatio:0.50, marketCap:8*S, peRatio:9.5, market:"CN", currency:"CNY" },
  { ticker:"600987", name:"航民股份", sector:"纺织服饰", industry:"印染", price:8.00, dividendYield:4.5, frequency:"annual", dividendPerShare:0.360, exDate:"2026-07-10", payDate:"2026-07-24", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:10, payoutRatio:0.55, marketCap:8*S, peRatio:11.5, market:"CN", currency:"CNY" },
  { ticker:"601886", name:"江河集团", sector:"建筑", industry:"装修装饰", price:6.00, dividendYield:5.0, frequency:"annual", dividendPerShare:0.300, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:6.0, divGrowth3y:5.5, divGrowth5y:5.0, divYears:6, payoutRatio:0.80, marketCap:7*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"601678", name:"滨化股份", sector:"基础化工", industry:"氯碱", price:5.00, dividendYield:4.0, frequency:"annual", dividendPerShare:0.200, exDate:"2026-07-14", payDate:"2026-07-28", divGrowth1y:5.5, divGrowth3y:5.0, divGrowth5y:4.5, divYears:8, payoutRatio:0.45, marketCap:10*S, peRatio:10.5, market:"CN", currency:"CNY" },
  { ticker:"600377", name:"宁沪高速", sector:"交通运输", industry:"高速公路", price:14.00, dividendYield:7.5, frequency:"annual", dividendPerShare:1.050, exDate:"2026-07-12", payDate:"2026-07-26", divGrowth1y:5.0, divGrowth3y:4.5, divGrowth5y:4.0, divYears:15, payoutRatio:0.77, marketCap:70*S, peRatio:12.5, market:"CN", currency:"CNY" },
]

// ── Merge & deduplicate ──
const allStocks = [...usStocks, ...cnStocks]
const seen = new Set<string>()
const uniqueStocks = allStocks.filter(s => {
  if (seen.has(s.ticker)) return false
  seen.add(s.ticker)
  return true
})

// ── Date generators ──
function quarterlyDates(baseEx: string, quarters: number): { exDate: string; payDate: string }[] {
  const dates: { exDate: string; payDate: string }[] = []
  const d = new Date(baseEx)
  for (let i = 0; i < quarters; i++) {
    const ex = new Date(d)
    ex.setMonth(ex.getMonth() - i * 3)
    const pay = new Date(ex)
    pay.setDate(pay.getDate() + 14)
    dates.push({
      exDate: ex.toISOString().slice(0, 10),
      payDate: pay.toISOString().slice(0, 10),
    })
  }
  return dates
}

function monthlyDates(baseEx: string, months: number): { exDate: string; payDate: string }[] {
  const dates: { exDate: string; payDate: string }[] = []
  const d = new Date(baseEx)
  for (let i = 0; i < months; i++) {
    const ex = new Date(d)
    ex.setMonth(ex.getMonth() - i)
    const pay = new Date(ex)
    pay.setDate(pay.getDate() + 17)
    dates.push({
      exDate: ex.toISOString().slice(0, 10),
      payDate: pay.toISOString().slice(0, 10),
    })
  }
  return dates
}

function annualDates(baseEx: string, years: number): { exDate: string; payDate: string }[] {
  const dates: { exDate: string; payDate: string }[] = []
  const d = new Date(baseEx)
  for (let i = 0; i < years; i++) {
    const ex = new Date(d)
    ex.setFullYear(ex.getFullYear() - i)
    const pay = new Date(ex)
    pay.setDate(pay.getDate() + 14)
    dates.push({
      exDate: ex.toISOString().slice(0, 10),
      payDate: pay.toISOString().slice(0, 10),
    })
  }
  return dates
}

function semiAnnualDates(baseEx: string, years: number): { exDate: string; payDate: string }[] {
  const dates: { exDate: string; payDate: string }[] = []
  const d = new Date(baseEx)
  for (let i = 0; i < years * 2; i++) {
    const ex = new Date(d)
    ex.setMonth(ex.getMonth() - i * 6)
    const pay = new Date(ex)
    pay.setDate(pay.getDate() + 14)
    dates.push({
      exDate: ex.toISOString().slice(0, 10),
      payDate: pay.toISOString().slice(0, 10),
    })
  }
  return dates
}

function weeklyPrices(basePrice: number, weeks: number): { date: string; close: number; change: number }[] {
  const prices: { date: string; close: number; change: number }[] = []
  const today = new Date("2026-07-21")
  let price = basePrice
  for (let i = 0; i < weeks; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    const drift = (Math.random() - 0.48) * 2.5
    const noise = (Math.random() - 0.5) * 4
    price = price + drift + noise
    if (price < basePrice * 0.6) price = basePrice * 0.65
    if (price > basePrice * 1.4) price = basePrice * 1.35
    const change = ((price - (prices[i-1]?.close ?? price)) / (prices[i-1]?.close ?? price) * 100)
    prices.push({
      date: d.toISOString().slice(0, 10),
      close: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
    })
  }
  return prices
}

async function main() {
  // ── Clear existing data (FK order) ──
  console.log("Clearing existing data...")
  await prisma.holding.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.dividendHistory.deleteMany()
  await prisma.stock.deleteMany()
  console.log("Cleared.")

  console.log(`Seeding ${uniqueStocks.length} stocks...`)
  let usCount = 0, cnCount = 0

  for (const s of uniqueStocks) {
    const stock = await prisma.stock.create({
      data: {
        ticker: s.ticker,
        name: s.name,
        market: s.market,
        sector: s.sector,
        industry: s.industry,
        currency: s.currency,
        price: s.price,
        dividendYield: s.dividendYield,
        frequency: s.frequency,
        dividendPerShare: s.dividendPerShare,
        exDate: s.exDate,
        payDate: s.payDate,
        divGrowth1y: s.divGrowth1y,
        divGrowth3y: s.divGrowth3y,
        divGrowth5y: s.divGrowth5y,
        divYears: s.divYears,
        payoutRatio: s.payoutRatio,
        marketCap: s.marketCap,
        peRatio: s.peRatio,
      },
    })

    if (s.market === "US") usCount++
    else cnCount++

    // ── Dividend history ──
    let divDates: { exDate: string; payDate: string }[] = []
    if (s.frequency === "monthly") {
      divDates = monthlyDates(s.exDate, 24)
    } else if (s.frequency === "quarterly") {
      divDates = quarterlyDates(s.exDate, 8)
    } else if (s.frequency === "semi-annual") {
      divDates = semiAnnualDates(s.exDate, 4)
    } else {
      divDates = annualDates(s.exDate, 5)
    }

    for (const d of divDates) {
      await prisma.dividendHistory.create({
        data: {
          ticker: s.ticker,
          exDate: d.exDate,
          payDate: d.payDate,
          amount: s.dividendPerShare,
          type: "regular",
          currency: s.currency,
        },
      })
    }

    // ── Price history (52 weeks) ──
    const prices = weeklyPrices(s.price, 52)
    for (const p of prices) {
      await prisma.priceHistory.create({
        data: {
          ticker: s.ticker,
          date: p.date,
          close: p.close,
          change: p.change,
        },
      })
    }
  }

  console.log("Seeding complete!")
  console.log(`  US stocks:  ${usCount}`)
  console.log(`  CN stocks:  ${cnCount}`)
  console.log(`  Total:      ${usCount + cnCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
