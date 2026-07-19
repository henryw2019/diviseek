"use client"

import { useRef, useState, useEffect } from "react"
import { Plus, ListFilter, Compass, Repeat, Check } from "lucide-react"
import { holdings as initialHoldings, freqLabel, type Holding, type Frequency } from "@/lib/diviseek-data"
import { TickerBadge, formatCNY } from "./shared"
import { cn } from "@/lib/utils"
import { getHoldings as fetchHoldings, updateHolding } from "@/lib/api"
import { useSettings, formatCurrency } from "@/lib/settings-context"

type Sort = "yield" | "income" | "date"
const sortLabels: Record<Sort, string> = {
  yield: "按收益率",
  income: "按收入",
  date: "按日期",
}

type HoldingSummary = {
  annualIncome: number
  monthlyAverage: number
  holdingsCount: number
  averageYield: number
}

export function HoldingsScreen({
  user,
  requireAuth,
  onAddHolding,
}: {
  user?: any
  requireAuth?: () => boolean
  onAddHolding?: () => void
}) {
  const { currency } = useSettings()
  const [list, setList] = useState<Holding[]>(initialHoldings)
  const [summary, setSummary] = useState<HoldingSummary>({
    annualIncome: 48520,
    monthlyAverage: 4043,
    holdingsCount: 8,
    averageYield: 3.8,
  })
  const [sort, setSort] = useState<Sort>("yield")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setList(initialHoldings)
      setSummary({ annualIncome: 48520, monthlyAverage: 4043, holdingsCount: 8, averageYield: 3.8 })
      return
    }
    setLoading(true)
    fetchHoldings()
      .then((data) => {
        setList(data.holdings)
        setSummary(data.summary)
      })
      .catch(() => {
        setList([])
        setSummary({ annualIncome: 0, monthlyAverage: 0, holdingsCount: 0, averageYield: 0 })
      })
      .finally(() => setLoading(false))
  }, [user])

  const sorted = [...list].sort((a, b) => {
    if (sort === "yield") return b.yield - a.yield
    if (sort === "income") return b.annualIncome - a.annualIncome
    return a.nextExDate.localeCompare(b.nextExDate)
  })

  const cycleSort = () => {
    const order: Sort[] = ["yield", "income", "date"]
    setSort(order[(order.indexOf(sort) + 1) % order.length])
  }

  const toggleDrip = (ticker: string) => {
    setList((prev) => prev.map((h) => (h.ticker === ticker ? { ...h, drip: !h.drip } : h)))
  }

  const handleAdd = () => {
    if (requireAuth && !requireAuth()) return
    onAddHolding?.()
  }

  return (
    <div className="relative min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f172a]/90 px-5 pb-4 pt-8 backdrop-blur-xl">
        <h1 className="text-lg font-bold">持仓</h1>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="持仓数" value={`${summary.holdingsCount}`} />
          <Stat label="平均收益率" value={`${summary.averageYield}%`} gold />
          <Stat label="总年股息" value={formatCurrency(summary.annualIncome, currency)} />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={cycleSort}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium"
          >
            <ListFilter className="size-3.5 text-primary" />
            {sortLabels[sort]}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      ) : list.length === 0 ? (
        <EmptyState onReset={handleAdd} />
      ) : (
        <ul className="flex flex-col gap-2.5 px-5 py-4">
          {sorted.map((h) => (
            <HoldingRow key={h.ticker} holding={h} onToggleDrip={() => toggleDrip(h.ticker)} currency={currency} />
          ))}
        </ul>
      )}

      {/* FAB */}
      <button
        onClick={handleAdd}
        aria-label="添加持仓"
        className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-card px-2.5 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-sm font-bold tabular-nums", gold && "text-primary")}>{value}</p>
    </div>
  )
}

function HoldingRow({ holding, onToggleDrip, currency }: { holding: Holding; onToggleDrip: () => void; currency: string }) {
  const [dx, setDx] = useState(0)
  const [open, setOpen] = useState(false)
  const startX = useRef(0)
  const dragging = useRef(false)

  const REVEAL = 96

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true
    startX.current = e.clientX - dx
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const next = Math.max(0, Math.min(REVEAL, e.clientX - startX.current))
    setDx(next)
  }
  const onUp = () => {
    dragging.current = false
    const shouldOpen = dx > REVEAL / 2
    setDx(shouldOpen ? REVEAL : 0)
    setOpen(shouldOpen)
  }

  return (
    <li className="relative overflow-hidden rounded-2xl">
      {/* Revealed DRIP control */}
      <div className="absolute inset-y-0 left-0 flex w-24 flex-col items-center justify-center gap-1.5 rounded-2xl bg-card">
        <button
          onClick={onToggleDrip}
          role="switch"
          aria-checked={holding.drip}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            holding.drip ? "bg-[color:var(--success)]" : "bg-white/15",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 flex size-5 items-center justify-center rounded-full bg-white transition-all",
              holding.drip ? "left-[22px]" : "left-0.5",
            )}
          >
            <Repeat className="size-3 text-[#0f172a]" />
          </span>
        </button>
        <span className={cn("px-1 text-center text-[9px] leading-tight", holding.drip ? "text-[color:var(--success)]" : "text-muted-foreground")}>
          {holding.drip ? "股息再投资" : "现金分红"}
        </span>
      </div>

      {/* Foreground row */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ transform: `translateX(${dx}px)`, touchAction: "pan-y" }}
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-white/5 bg-card p-3.5",
          !dragging.current && "transition-transform duration-200",
        )}
      >
        <TickerBadge ticker={holding.ticker} color={holding.color} className="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{holding.name}</p>
            {holding.drip && (
              <span className="inline-flex items-center gap-0.5 rounded bg-[color:var(--success)]/15 px-1 py-px text-[9px] text-[color:var(--success)]">
                <Check className="size-2.5" />再投资
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {holding.shares} 股 · {freqLabel[holding.frequency]}派息
            {holding.avgCost ? ` · 均价 $${holding.avgCost}` : ""}
            {holding.purchaseDate ? ` · ${holding.purchaseDate.slice(5)}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary tabular-nums">{holding.yield}%</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">除息 {holding.nextExDate.slice(5)}</p>
          <p className="text-[11px] text-muted-foreground tabular-nums">年 {formatCurrency(holding.annualIncome, currency)}</p>
        </div>
      </div>
      {!open && dx === 0 && (
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40">
          ←滑
        </span>
      )}
    </li>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <div className="relative mb-6 flex size-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
        <Compass className="size-12 text-primary" strokeWidth={1.4} />
        <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" />
      </div>
      <h2 className="text-base font-semibold">还没有持仓</h2>
      <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
        添加你的第一只股票，开启寻息之旅
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        添加第一只股票开始寻息
      </button>
    </div>
  )
}
