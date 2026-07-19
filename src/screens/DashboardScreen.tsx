"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronRight, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { holdings, quotes, totalAnnualDividend, getDividendEvents } from "@/lib/data";

const tickerColors: Record<string, string> = {
  O: "#22C55E",
  KO: "#EF4444",
  AAPL: "#64748B",
  JNJ: "#3B82F6",
  PG: "#8B5CF6",
  V: "#F59E0B",
  JPM: "#3B82F6",
  MSFT: "#3B82F6",
};

function getNext30Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

export default function DashboardScreen() {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: ReturnType<typeof getDividendEvents> } | null>(null);
  const now = new Date();
  const quote = quotes[now.getDate() % quotes.length];
  const next30 = getNext30Days();

  useEffect(() => {
    const target = totalAnnualDividend;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAmount(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const handleDayClick = (day: Date) => {
    const year = day.getFullYear();
    const month = day.getMonth();
    const allEvents = getDividendEvents(year, month);
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const dayEvents = allEvents.filter((e) => e.date === dayStr);
    if (dayEvents.length > 0) {
      setSelectedDayEvents({
        date: `${month + 1}月${day.getDate()}日`,
        events: dayEvents,
      });
    }
  };

  return (
    <div className="px-4 pt-2 space-y-5">
      <div className="flex items-center justify-between pt-4">
        <div>
          <p className="text-2xl font-bold">寻息</p>
          <p className="text-xs text-muted">DiviSeek</p>
        </div>
        <span className="text-xs bg-[#1E293B] text-muted px-3 py-1 rounded-full">
          {now.getFullYear()} 年度
        </span>
      </div>

      <div className="rounded-2xl bg-[#1E293B] p-5">
        <p className="text-sm text-muted mb-1">年度股息收入</p>
        <p className="text-4xl font-bold gold-gradient-text">
          ¥{displayAmount.toLocaleString()}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted">月均 ¥{(totalAnnualDividend / 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
          <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp size={12} />
            +8.4%
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">未来 30 天</h2>
          <Link href="/calendar" className="p-2 rounded-lg bg-[#1E293B] text-muted hover:text-foreground transition-colors active:scale-95">
            <Calendar size={18} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {next30.map((day) => {
            const mm = String(day.getMonth() + 1).padStart(2, "0");
            const dd = String(day.getDate()).padStart(2, "0");
            const hasEvent = holdings.some((h) => {
              const [pm, pd] = h.nextPayDate.split("-");
              return pm === mm && pd === dd;
            });
            const isToday = day.getDate() === now.getDate() && day.getMonth() === now.getMonth();
            return (
              <button
                key={dd + mm}
                onClick={() => handleDayClick(day)}
                className={`flex flex-col items-center gap-1 min-w-[44px] py-2 rounded-xl transition-all active:scale-95 ${
                  hasEvent ? "bg-[#1E293B] hover:bg-[#334155] cursor-pointer" : "bg-[#1E293B]/50"
                } ${isToday ? "ring-1 ring-gold" : ""}`}
              >
                <span className="text-[10px] text-muted">{weekdays[day.getDay()]}</span>
                <span className="text-sm font-medium">{day.getDate()}</span>
                {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDayEvents && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedDayEvents(null)} />
          <div className="fixed inset-x-0 bottom-0 bg-[#1E293B] rounded-t-2xl p-6 z-50 animate-slide-up max-w-[430px] mx-auto">
            <div className="w-10 h-1 rounded-full bg-[#334155] mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedDayEvents.date} 派息</h3>
              <button onClick={() => setSelectedDayEvents(null)} className="p-1 rounded-lg hover:bg-[#334155] active:scale-95">
                <X size={20} className="text-muted" />
              </button>
            </div>
            <div className="space-y-3">
              {selectedDayEvents.events.map((e, i) => {
                const holding = holdings.find((h) => h.ticker === e.ticker);
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0F172A]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: tickerColors[e.ticker] || "#64748B" }}
                      >
                        {e.ticker[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{e.ticker} {holding?.name}</p>
                        <p className="text-xs text-muted">{e.type === "ex" ? "除息日" : "派息日"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gold">¥{e.amount.toLocaleString()}</p>
                      <p className={`text-[10px] ${e.confirmed ? "text-success" : "text-muted"}`}>
                        {e.confirmed ? "已确认" : "预估"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="rounded-2xl bg-gradient-to-br from-[#D97706] to-[#F59E0B] p-5">
        <p className="text-xs text-[#0F172A]/60 mb-2">今日寻息金句</p>
        <p className="text-base font-medium text-[#0F172A] italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-xs text-[#0F172A]/70 mt-2">— {quote.author}</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">核心持仓</h2>
          <Link href="/holdings" className="text-xs text-gold flex items-center gap-1 active:scale-95 transition-transform">
            全部 {holdings.length} 只
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {holdings.slice(0, 4).map((h) => (
            <div
              key={h.id}
              className="rounded-xl bg-[#1E293B] p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: tickerColors[h.ticker] || "#64748B" }}
              >
                {h.ticker[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{h.name}</span>
                  <span className="text-gold text-sm font-medium">{h.yieldPercent}%</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted">
                    {h.shares} 股 · 下次 {h.nextPayDate}
                  </span>
                  <span className="text-xs text-muted">
                    年 ¥{h.annualDividend.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
