"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getDividendEvents, holdings } from "@/lib/data";

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [typeFilter, setTypeFilter] = useState<"ex" | "pay">("ex");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const allEvents = getDividendEvents(year, month);
  const events = allEvents.filter((e) => e.type === typeFilter);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfWeek + 6) % 7;

  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr && e.type === typeFilter);
  };

  const allEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const monthNames = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
    setSelectedDay(null);
    setPanelOpen(false);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
    setSelectedDay(null);
    setPanelOpen(false);
  };

  const openPanel = (day: number) => {
    const dayEvts = allEventsForDay(day);
    if (dayEvts.length > 0) {
      setSelectedDay(day);
      setPanelOpen(true);
    }
  };

  const totalEstimate = events.reduce((s, e) => s + e.amount, 0);

  const panelEvents = selectedDay !== null
    ? allEventsForDay(selectedDay).filter((e) => e.type === typeFilter)
    : [];

  return (
    <div className="px-4 pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors active:scale-95">
          <ChevronLeft size={20} className="text-muted" />
        </button>
        <h1 className="text-lg font-semibold">{year}年 {monthNames[month]}</h1>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors active:scale-95">
          <ChevronRight size={20} className="text-muted" />
        </button>
      </div>

      <div className="flex gap-2">
        {(["ex", "pay"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              typeFilter === t ? "bg-gold text-[#0F172A] shadow-sm shadow-gold/30" : "bg-[#1E293B] text-muted"
            }`}
          >
            {t === "ex" ? "除息日" : "派息日"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
          <div key={d} className="text-xs text-muted py-2">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayEvts = eventsForDay(day);
          const todayMark = isToday(day);
          return (
            <button
              key={day}
              onClick={() => openPanel(day)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-all active:scale-95 ${
                todayMark ? "border-2 border-gold font-bold" : ""
              } ${dayEvts.length > 0 ? "hover:bg-[#1E293B] cursor-pointer" : "cursor-default text-muted/50"}`}
            >
              <span>{day}</span>
              {dayEvts.length > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    dayEvts.some((e) => e.confirmed) ? "bg-gold" : "bg-gray-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl bg-[#1E293B] p-4 text-center">
        <p className="text-sm text-muted">本月预估股息</p>
        <p className="text-xl font-bold text-gold">¥{totalEstimate.toLocaleString()}</p>
      </div>

      {panelOpen && selectedDay !== null && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 bg-[#1E293B] rounded-t-2xl p-6 z-50 animate-slide-up max-w-[430px] mx-auto">
            <div className="w-10 h-1 rounded-full bg-[#334155] mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {year}年{monthNames[month]} {selectedDay}日
              </h3>
              <button onClick={() => setPanelOpen(false)} className="p-1 rounded-lg hover:bg-[#334155] active:scale-95">
                <X size={20} className="text-muted" />
              </button>
            </div>
            {panelEvents.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">当日无{typeFilter === "ex" ? "除息" : "派息"}事件</p>
            ) : (
              <div className="space-y-3">
                {panelEvents.map((e, i) => {
                  const holding = holdings.find((h) => h.ticker === e.ticker);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0F172A] active:bg-[#1a2744] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-gold">{e.ticker[0]}</span>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
