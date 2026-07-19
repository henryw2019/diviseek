"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass, ChevronRight } from "lucide-react"
import {
  holdings as mockHoldings,
  portfolioSummary as mockSummary,
  dividendEvents,
  quotes,
  type Holding,
} from "@/lib/diviseek-data"
import { TickerBadge, formatCNY } from "./shared"
import type { TabKey } from "./bottom-nav"
import { cn } from "@/lib/utils"
import { getHoldings as fetchHoldings } from "@/lib/api"

const TODAY = new Date("2026-07-13")

function buildStrip(exDates: string[]) {
  const days: { date: Date; iso: string; hasDiv: boolean }[] = []
  const exDateSet = new Set(exDates)
  for (let i = 0; i < 30; i++) {
    const d = new Date(TODAY)
    d.setDate(TODAY.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    days.push({ date: d, iso, hasDiv: exDateSet.has(iso) })
  }
  return days
}

const weekdayCN = ["日", "一", "二", "三", "四", "五", "六"]

export function DashboardScreen({
  user,
  onNavigate,
}: {
  user?: any
  onNavigate: (t: TabKey) => void
}) {
  const [realHoldings, setRealHoldings] = useState<Holding[]>([])
  const [summary, setSummary] = useState(mockSummary)

  useEffect(() => {
    if (!user) {
      setRealHoldings([])
      setSummary(mockSummary)
      return
    }
    fetchHoldings()
      .then((data) => {
        setRealHoldings(data.holdings)
        setSummary(data.summary)
      })
      .catch(() => {
        setRealHoldings([])
        setSummary({ annualIncome: 0, monthlyAverage: 0, holdingsCount: 0, averageYield: 0 })
      })
  }, [user])

  const activeHoldings = user ? realHoldings : mockHoldings
  const activeSummary = user ? summary : mockSummary

  const annual = activeSummary.annualIncome
  const exDates = useMemo(() => activeHoldings.map((h) => h.nextExDate), [activeHoldings])
  const strip = useMemo(() => buildStrip(exDates), [exDates])
  const [selected, setSelected] = useState<string | null>(null)

  const topHoldings = [...activeHoldings].sort((a, b) => b.annualIncome - a.annualIncome).slice(0, 4)

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
            <Compass className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">寻息</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">DiviSeek</p>
          </div>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
          2026 年度
        </span>
      </header>

      {/* Hero income */}
      <section className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-transparent p-1">
        <div className="rounded-[20px] border border-white/5 bg-card/40 px-5 py-6">
          <p className="text-sm text-muted-foreground">年度股息收入</p>
          <p className="mt-1 gold-text-gradient text-5xl font-bold tracking-tight tabular-nums">
            {formatCNY(annual)}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              月均 <span className="font-semibold text-foreground">{formatCNY(activeSummary.monthlyAverage)}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Calendar strip */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">未来 30 天</h2>
          <button
            onClick={() => onNavigate("calendar")}
            className="inline-flex items-center text-xs text-muted-foreground"
          >
            日历 <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {strip.map(({ date, iso, hasDiv }, i) => {
            const isToday = i === 0
            const active = selected === iso
            return (
              <button
                key={iso}
                onClick={() => hasDiv && setSelected(active ? null : iso)}
                className={cn(
                  "relative flex w-12 shrink-0 flex-col items-center gap-1 rounded-2xl border py-2.5 transition-all",
                  active
                    ? "border-primary bg-primary/10"
                    : isToday
                      ? "border-primary/40 bg-white/[0.03]"
                      : "border-white/5 bg-white/[0.02]",
                )}
              >
                <span className="text-[10px] text-muted-foreground">
                  {weekdayCN[date.getDay()]}
                </span>
                <span className={cn("text-sm font-semibold tabular-nums", isToday && "text-primary")}>
                  {date.getDate()}
                </span>
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    hasDiv ? "bg-primary shadow-[0_0_8px] shadow-primary/60" : "bg-transparent",
                  )}
                />
              </button>
            )
          })}
        </div>
        {selected && (
          <StripTooltip iso={selected} holdings={activeHoldings} />
        )}
      </section>

      {/* Quote banner */}
      <QuoteBanner />

      {/* Portfolio cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">核心持仓</h2>
          <button
            onClick={() => onNavigate("holdings")}
            className="inline-flex items-center text-xs text-muted-foreground"
          >
            全部 {activeSummary.holdingsCount} 只 <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {topHoldings.map((h) => (
            <div
              key={h.ticker}
              className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-card p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-black/30"
            >
              <TickerBadge ticker={h.ticker} color={h.color} className="size-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold">{h.name}</p>
                  <p className="text-sm font-bold text-primary tabular-nums">{h.yield}%</p>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {h.shares} 股 · 下次 {h.nextExDate.slice(5)}
                  </p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    年 {formatCNY(h.annualIncome)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StripTooltip({ iso, holdings }: { iso: string; holdings: Holding[] }) {
  const h = holdings.find((h) => h.nextExDate === iso)
  if (!h) return null
  return (
    <div className="mt-3 animate-[marquee-up_0.3s_ease-out] rounded-2xl border border-primary/25 bg-card p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{h.ticker}</span>
          <span className="text-sm text-foreground">{h.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{iso}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        年 {formatCNY(h.annualIncome)}
      </p>
    </div>
  )
}

function QuoteBanner() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 4500)
    return () => clearInterval(t)
  }, [])
  const q = quotes[idx]
  return (
    <section className="overflow-hidden rounded-2xl border border-white/5 bg-card/60">
      <div key={idx} className="animate-[marquee-up_0.5s_ease-out] border-l-2 border-primary py-3.5 pl-4 pr-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-primary/80">今日寻息金句</p>
        <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-foreground text-pretty">
          “{q.text}”
        </p>
        <p className="mt-1 text-xs text-muted-foreground">— {q.author}</p>
      </div>
    </section>
  )
}
