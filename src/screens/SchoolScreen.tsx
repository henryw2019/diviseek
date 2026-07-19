"use client";

import { useState, useRef, useCallback } from "react";
import { Search, ChevronRight, Flame, X, ArrowLeft } from "lucide-react";
import { articles, categories, type Article } from "@/lib/data";

function ProgressRing({ progress, size = 48 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#334155" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F59E0B" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
      />
    </svg>
  );
}

const articleBodies: Record<string, string[]> = {
  "1": [
    "股息贵族（Dividend Aristocrats）是指那些连续至少25年提高年度股息的标普500指数成分公司。这些公司穿越了多个经济周期，包括2008年金融危机和2020年新冠疫情期间，依然坚持提高股息。",
    "在众多股息贵族中，有一些公司更是将这一传统延续了超过50年，被称为\u201C股息之王\u201D。这些公司包括：可口可乐（KO）、强生（JNJ）、宝洁（PG）、以及 Realty Income（O）等。",
    "投资股息贵族的核心逻辑在于：能够持续提高股息的公司，必然拥有强大的定价权、稳定的现金流和优秀的管理层。这些公司的商业模式经过了时间的考验。",
    "以可口可乐为例，它已经连续62年提高股息。即使在饮料行业竞争日益激烈的今天，其全球品牌力和分销网络仍然构成了巨大的护城河。",
    "构建一个以股息贵族为核心的组合，可以帮助投资者在市场波动中保持冷静。当你每个月都能收到稳定的股息收入时，短期的价格波动就不再是威胁，而是机会。",
  ],
  "2": [
    "DRIP（Dividend Reinvestment Plan，股息再投资计划）是一种将收到的股息自动用于购买更多股份的投资策略。通过复利效应，DRIP可以显著加速财富增长。",
    "假设你投资了10万元在一个年化股息率为4%的股票上，如果不使用DRIP，20年后你的投资仍然是10万元（不含股价增值）。但如果你启用DRIP，将所有股息再投资，20年后你将拥有约21.9万元的股份。",
    "这就是复利的力量\u2014\u2014爱因斯坦称之为\u201C世界第八大奇迹\u201D。4%的股息率加上DRIP，实际上创造了一个年化约4%的自动再投资增长。",
    "在\u201C寻息\u201D应用中，你可以为每个持仓单独开启或关闭DRIP。在持仓页面，向右滑动即可看到DRIP开关。",
    "需要注意的是，DRIP在税务方面可能有影响。在某些市场，股息再投资可能触发应税事件。建议在启用DRIP前咨询税务顾问。",
  ],
  "3": [
    "构建月度现金流组合的关键在于分散派息日期。大多数美股公司按季度派息，但不同公司的派息月份不同。通过合理选择持仓，你可以实现每月都有股息入账。",
    "一个经典的月度现金流组合方案是：1月持有JNJ和MSFT，2月持有KO和PG，3月持有JPM和V，4月持有AAPL和O。以此类推，覆盖全年12个月。",
    "Realty Income（O）是一家特殊的REITs公司，它每月派息而非季度派息。将O纳入组合可以为每个月提供稳定的现金流基础。",
    "在构建组合时，除了考虑派息日期，还需要关注股息的安全性。支付率过高（超过70%）的公司可能面临削减股息的风险。",
    "使用\u201C寻息\u201D的日历功能，你可以清楚地看到每个月的派息安排，确保现金流的连续性。",
  ],
  "4": [
    "REITs（Real Estate Investment Trusts，房地产投资信托基金）是一种通过集合投资者资金来投资房地产资产的投资工具。REITs公司必须将至少90%的应税收入以股息形式分配给股东。",
    "与直接投资房地产相比，REITs具有流动性好、门槛低、分散化等优势。投资者无需直接管理物业，也不需要大额资金购买房产。",
    "在众多REITs中，Realty Income（O）以其按月派息的特点而闻名。它拥有超过13,000处商业地产，租户包括沃尔玛、7-Eleven等知名企业。",
    "选择REITs时需要关注的关键指标包括：FFO（运营资金）、股息支付率、物业组合的多样性和租约期限。健康的REITs应该拥有长期租约和高质量租户。",
    "在利率上升的环境中，REITs可能面临压力，因为更高的利率会增加融资成本并可能降低物业价值。但从长期来看，优质REITs仍然是收入投资组合的重要组成部分。",
  ],
};

const defaultBody = articleBodies["1"];

export default function SchoolScreen() {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = articles.filter((a) => {
    const matchCategory = selectedCategory === "全部" || a.category === selectedCategory;
    const matchSearch = !searchQuery || a.title.includes(searchQuery) || a.summary.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const heroArticle = articles.find((a) => a.readProgress > 0) || articles[0];
  const continueReading = articles.filter((a) => a.readProgress > 0 && a.id !== heroArticle.id);

  const openArticleReader = (article: Article) => {
    setOpenArticle(article);
    setReadProgress(article.readProgress);
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !openArticle) return;
    const el = scrollRef.current;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      const pct = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
      setReadProgress(Math.max(pct, openArticle.readProgress));
    }
  }, [openArticle]);

  const body = openArticle && articleBodies[openArticle.id] ? articleBodies[openArticle.id] : defaultBody;

  return (
    <div className="px-4 pt-4 space-y-4 pb-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="搜索文章..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1E293B] border border-[#334155] rounded-full pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              selectedCategory === c ? "bg-gold text-[#0F172A] shadow-sm shadow-gold/30" : "bg-[#1E293B] text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {selectedCategory === "全部" && !searchQuery && (
        <>
          <button
            onClick={() => openArticleReader(heroArticle)}
            className={`w-full text-left rounded-2xl bg-gradient-to-br ${heroArticle.coverColor} p-6 active:scale-[0.98] transition-transform`}
          >
            <p className="text-xs text-white/70 mb-1">{heroArticle.category}</p>
            <h3 className="text-lg font-bold text-white mb-2">{heroArticle.title}</h3>
            <p className="text-sm text-white/80 mb-3">{heroArticle.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">约 {heroArticle.readTime} 分钟</span>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full font-medium">
                继续阅读
              </span>
            </div>
          </button>

          {continueReading.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted mb-2">继续阅读</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {continueReading.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openArticleReader(a)}
                    className="shrink-0 w-28 flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1E293B] active:scale-95 transition-transform"
                  >
                    <div className="relative">
                      <ProgressRing progress={a.readProgress} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gold">
                        {a.readProgress}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted text-center line-clamp-2">{a.title}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0F172A]/20 flex items-center justify-center">
              <Flame size={20} className="text-[#0F172A]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">连续打卡 7 天</p>
              <p className="text-xs text-[#0F172A]/70">继续加油!</p>
            </div>
          </div>
        </>
      )}

      <div className="space-y-3">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => openArticleReader(a)}
            className="w-full text-left rounded-xl bg-[#1E293B] p-4 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-sm flex-1 mr-2">{a.title}</h3>
              <span className="shrink-0 text-[10px] bg-[#0F172A] text-muted px-2 py-0.5 rounded-full">
                {a.category}
              </span>
            </div>
            <p className="text-xs text-muted mb-2 line-clamp-2">{a.summary}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted">约 {a.readTime} 分钟</span>
              <ChevronRight size={14} className="text-muted" />
            </div>
            {a.quote && (
              <div className="mt-3 pl-3 border-l-2 border-gold">
                <p className="text-xs text-gold italic">&ldquo;{a.quote.text}&rdquo;</p>
                <p className="text-[10px] text-muted mt-1">— {a.quote.author}</p>
              </div>
            )}
            {a.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {a.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-[#334155] text-muted px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {openArticle && (
        <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col">
          <div className="shrink-0 bg-[#0F172A]">
            <div className="h-1 bg-[#1E293B]">
              <div className="h-full bg-gold transition-all duration-300" style={{ width: `${readProgress}%` }} />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setOpenArticle(null)} className="p-2 rounded-lg hover:bg-[#1E293B] active:scale-95 transition-transform">
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <span className="text-xs text-muted">{readProgress}% 已读</span>
              <button onClick={() => setOpenArticle(null)} className="p-2 rounded-lg hover:bg-[#1E293B] active:scale-95 transition-transform">
                <X size={20} className="text-foreground" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 pb-10"
          >
            <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">{openArticle.category}</span>
            <h1 className="text-2xl font-bold mt-3 mb-2">{openArticle.title}</h1>
            <div className="flex items-center gap-3 text-xs text-muted mb-6">
              <span>{openArticle.author}</span>
              <span>·</span>
              <span>约 {openArticle.readTime} 分钟</span>
            </div>
            {openArticle.quote && (
              <div className="rounded-xl bg-[#1E293B] p-4 mb-6 border-l-4 border-gold">
                <p className="text-sm text-gold italic">&ldquo;{openArticle.quote.text}&rdquo;</p>
                <p className="text-xs text-muted mt-2">— {openArticle.quote.author}</p>
              </div>
            )}
            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              {body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {openArticle.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-[#1E293B]">
                <p className="text-xs text-muted mb-2">相关个股</p>
                <div className="flex gap-2">
                  {openArticle.tags.map((t) => (
                    <span key={t} className="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full font-medium">${t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="h-10" />
          </div>
        </div>
      )}
    </div>
  );
}
