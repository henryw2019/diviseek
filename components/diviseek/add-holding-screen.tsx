"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Repeat, Search, X } from "lucide-react"
import { TickerBadge, formatCNY } from "./shared"
import { cn } from "@/lib/utils"
import { createHolding } from "@/lib/api"
import { searchStocks, type StockInfo } from "@/lib/stocks"

export function AddHoldingScreen({
  onBack,
  onAdded,
}: {
  onBack: () => void
  onAdded: () => void
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
      await createHolding({
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
      onAdded()
    } catch {
      setLoading(false)
    }
  }

  const canSubmit = selected && shares && yieldVal

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a]">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="size-5 text-muted-foreground" />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold">添加持仓</h1>
          <div className="size-9" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <section className="pt-6">
          <p className="mb-2 text-xs text-muted-foreground">搜索股票代码或公司名称</p>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="输入代码或名称，如 AAPL / 苹果"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("")
                    resetSelection()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-[#1e293b] shadow-2xl">
                {searchResults.map((s) => (
                  <li key={s.ticker}>
                    <button
                      onClick={() => selectStock(s)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 active:bg-white/10"
                    >
                      <TickerBadge ticker={s.ticker} color="#64748b" className="size-9" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{s.ticker}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.name}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-muted-foreground">
                        {s.market}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {selected && (
          <section className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <TickerBadge ticker={selected.ticker} color="#64748b" className="size-12" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold">{selected.ticker}</p>
                <p className="text-sm text-muted-foreground truncate">{selected.name}</p>
              </div>
              <button
                onClick={resetSelection}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/15"
              >
                重新选择
              </button>
            </div>
          </section>
        )}

        {selected && (
          <section className="mt-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">股数 *</label>
                <input
                  placeholder="100"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">股息率 (%) *</label>
                <input
                  placeholder="3.5"
                  type="number"
                  step="0.1"
                  value={yieldVal}
                  onChange={(e) => setYieldVal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">可选信息</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">平均成本 ($)</label>
                  <input
                    placeholder="150.00"
                    type="number"
                    step="0.01"
                    value={avgCost}
                    onChange={(e) => setAvgCost(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">建仓时间</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4">
              <div>
                <span className="text-sm font-medium">股息再投资 (DRIP)</span>
                <p className="mt-0.5 text-xs text-muted-foreground">股息自动买入更多股份</p>
              </div>
              <button
                onClick={() => setDrip(!drip)}
                role="switch"
                aria-checked={drip}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors",
                  drip ? "bg-[color:var(--success)]" : "bg-white/15",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 flex size-5 items-center justify-center rounded-full bg-white transition-all",
                    drip ? "left-[26px]" : "left-1",
                  )}
                >
                  <Repeat className="size-3 text-[#0f172a]" />
                </span>
              </button>
            </div>

            {shares && yieldVal && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">预计年度股息收入</p>
                <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
                  {formatCNY(Math.round(parseFloat(shares) * parseFloat(yieldVal) * 10))}
                </p>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-white/5 bg-[#0f172a]/95 backdrop-blur-xl pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex gap-3 px-5 pt-4">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-white/10 py-3.5 text-sm font-medium text-muted-foreground hover:bg-white/5"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || !canSubmit}
            className="flex-1 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 active:bg-amber-600"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-[#0f172a]/20 border-t-[#0f172a]" />
                添加中...
              </span>
            ) : (
              "确认添加"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
