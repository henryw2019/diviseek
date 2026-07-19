"use client"

import { useRef, useState, useEffect } from "react"
import { Plus, ListFilter, Compass, Repeat, Check } from "lucide-react"
import { holdings as initialHoldings, freqLabel, type Holding, type Frequency } from "@/lib/diviseek-data"
import { TickerBadge, formatCNY } from "./shared"
import { cn } from "@/lib/utils"
import { getHoldings as fetchHoldings, createHolding, updateHolding } from "@/lib/api"
import { searchStocks, type StockInfo } from "@/lib/stocks"

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
}: {
  user?: any
  requireAuth?: () => boolean
}) {
  const [list, setList] = useState<Holding[]>(initialHoldings)
  const [summary, setSummary] = useState<HoldingSummary>({
    annualIncome: 48520,
    monthlyAverage: 4043,
    holdingsCount: 8,
    averageYield: 3.8,
  })
  const [sort, setSort] = useState<Sort>("yield")
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

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

  return (
    <div className="relative min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f172a]/90 px-5 pb-4 pt-8 backdrop-blur-xl">
        <h1 className="text-lg font-bold">持仓</h1>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="持仓数" value={`${summary.holdingsCount}`} />
          <Stat label="平均收益率" value={`${summary.averageYield}%`} gold />
          <Stat label="总年股息" value={formatCNY(summary.annualIncome)} />
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
        <EmptyState onReset={() => setShowAdd(true)} />
      ) : (
        <ul className="flex flex-col gap-2.5 px-5 py-4">
          {sorted.map((h) => (
            <HoldingRow key={h.ticker} holding={h} onToggleDrip={() => toggleDrip(h.ticker)} />
          ))}
        </ul>
      )}

      {/* FAB */}
      <button
        onClick={() => {
          if (requireAuth && !requireAuth()) return
          setShowAdd(!showAdd)
        }}
        aria-label="添加持仓"
        className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>

      {showAdd && (
        <AddHoldingSheet
          onClose={() => setShowAdd(false)}
          onAdded={(h) => {
            setList((prev) => [...prev, h])
            setShowAdd(false)
          }}
        />
      )}
    </div>
  )
}

function AddHoldingSheet({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: (h: Holding) => void
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<StockInfo | null>(null)
  const [shares, setShares] = useState("")
  const [yieldVal, setYieldVal] = useState("")
  const [avgCost, setAvgCost] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [drip, setDrip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<StockInfo[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (selected) return
    if (query.length >= 1) {
      setSearchResults(searchStocks(query))
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [query, selected])

  const selectStock = (stock: StockInfo) => {
    setSelected(stock)
    setQuery(`${stock.ticker} - ${stock.name}`)
    setShowResults(false)
    setYieldVal("")
  }

  const resetSelection = () => {
    setSelected(null)
    setQuery("")
    setYieldVal("")
    setShares("")
    setAvgCost("")
    setPurchaseDate("")
    setDrip(false)
  }

  const handleAdd = async () => {
    if (!selected || !shares || !yieldVal) return
    setLoading(true)
    try {
      const s = parseFloat(shares)
      const y = parseFloat(yieldVal)
      const ac = avgCost ? parseFloat(avgCost) : null
      const annualIncome = Math.round(s * y * 10)
      const result = await createHolding({
        ticker: selected.ticker,
        name: selected.name,
        shares: s,
        yield: y,
        frequency: selected.frequency,
        nextExDate: "2026-08-01",
        annualIncome,
        drip,
        color: "#64748b",
        avgCost: ac,
        purchaseDate: purchaseDate || null,
        market: selected.market,
      })
      onAdded(result.holding)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#0f172a] p-6 pb-10">
        <h2 className="mb-4 text-center text-base font-semibold">添加持仓</h2>

        {!selected ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">搜索股票代码或公司名称</p>
            <div className="relative">
              <input
                placeholder="输入代码或名称，如 AAPL / 苹果"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              {showResults && searchResults.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1e293b] shadow-xl">
                  {searchResults.map((s) => (
                    <li key={s.ticker}>
                      <button
                        onClick={() => selectStock(s)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                      >
                        <span className="text-xs font-bold text-primary">{s.ticker}</span>
                        <span className="flex-1 truncate text-sm">{s.name}</span>
                        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {s.market}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <TickerBadge ticker={selected.ticker} color="#64748b" className="size-10" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{selected.ticker}</p>
                <p className="text-xs text-muted-foreground truncate">{selected.name}</p>
              </div>
              <button onClick={resetSelection} className="text-xs text-primary">重新选择</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">股数 *</label>
                <input
                  placeholder="100"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">股息率 (%) *</label>
                <input
                  placeholder="3.5"
                  type="number"
                  step="0.1"
                  value={yieldVal}
                  onChange={(e) => setYieldVal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">平均成本 ($)</label>
                <input
                  placeholder="150.00"
                  type="number"
                  step="0.01"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-muted-foreground">建仓时间</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm">股息再投资 (DRIP)</span>
              <button
                onClick={() => setDrip(!drip)}
                role="switch"
                aria-checked={drip}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  drip ? "bg-[color:var(--success)]" : "bg-white/15",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 flex size-5 items-center justify-center rounded-full bg-white transition-all",
                    drip ? "left-[22px]" : "left-0.5",
                  )}
                >
                  <Repeat className="size-3 text-[#0f172a]" />
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-muted-foreground">取消</button>
          <button
            onClick={handleAdd}
            disabled={loading || !selected || !shares || !yieldVal}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0f172a] disabled:opacity-50"
          >
            {loading ? "添加中..." : "确认添加"}
          </button>
        </div>
      </div>
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

function HoldingRow({ holding, onToggleDrip }: { holding: Holding; onToggleDrip: () => void }) {
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
          <p className="text-[11px] text-muted-foreground tabular-nums">年 {formatCNY(holding.annualIncome)}</p>
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
