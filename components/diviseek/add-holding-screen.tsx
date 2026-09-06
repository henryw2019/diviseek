"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Repeat, Search, X } from "lucide-react"
import { TickerBadge, formatCNY, Skeleton } from "./shared"
import { cn } from "@/lib/utils"
import { createHolding, searchStocksApi } from "@/lib/api"

type StockResult = {
  ticker: string
  name: string
  market: string
  sector: string
  price: number | null
  dividendYield: number | null
  frequency: string
  dividendPerShare: number | null
  exDate: string | null
  divYears: number | null
  marketCap: number | null
}

export function AddHoldingScreen({
  onBack,
  onAdded,
}: {
  onBack: () => void
  onAdded: () => void
}) {
  const [query, setQuery] = useState("")
  const [market, setMarket] = useState<"US" | "CN" | "HK">("US")
  const [selected, setSelected] = useState<StockResult | null>(null)
  const [shares, setShares] = useState("")
  const [yieldVal, setYieldVal] = useState("")
  const [avgCost, setAvgCost] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [drip, setDrip] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<StockResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (selected) return
    if (query.length >= 1) {
      setSearchLoading(true)
      searchStocksApi(query, market)
        .then((data) => {
          setSearchResults(data.stocks)
          setShowResults(true)
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [query, selected, market])

  const selectStock = (stock: StockResult) => {
    setSelected(stock)
    setQuery(`${stock.ticker} - ${stock.name}`)
    setShowResults(false)
    setYieldVal(stock.dividendYield ? String(stock.dividendYield) : "")
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
        frequency: selected.frequency || "annual",
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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-nav-bg">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-xl hover:bg-surface-subtle"
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
          <div className="mb-3 flex gap-2">
            {(["US", "CN", "HK"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMarket(m)
                  setQuery("")
                  resetSelection()
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                  market === m
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-surface-subtle text-muted-foreground hover:bg-surface-hover",
                )}
              >
                {m === "US" ? "美股" : m === "CN" ? "A股" : "港股"}
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder={`输入代码或名称，如 ${market === "CN" ? "600519 / 贵州茅台" : "AAPL / 苹果"}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle py-3 pl-10 pr-10 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("")
                    resetSelection()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {showResults && (
              <ul className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border-subtle bg-popover shadow-2xl">
                {searchLoading ? (
                  <li className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </li>
                ) : searchResults.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                    未找到匹配的股票
                  </li>
                ) : (
                  searchResults.map((s) => (
                    <li key={s.ticker}>
                      <button
                        onClick={() => selectStock(s)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-subtle active:bg-surface-hover"
                      >
                        <TickerBadge ticker={s.ticker} color="#64748b" className="size-9" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{s.ticker}</p>
                            {s.price && (
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {s.market === "US" ? "$" : "¥"}
                                {s.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{s.name}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {s.dividendYield && (
                              <span className="text-[10px] font-medium text-primary">{s.dividendYield}%</span>
                            )}
                            {s.divYears && (
                              <span className="text-[10px] text-muted-foreground">{s.divYears}年派息</span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-surface-hover px-2.5 py-1 text-[10px] text-muted-foreground">
                          {s.market}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </section>

        {selected && (
          <section className="mt-6">
            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-4">
              <div className="flex items-center gap-3">
                <TickerBadge ticker={selected.ticker} color="#64748b" className="size-12" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{selected.ticker}</p>
                    {selected.price && (
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {selected.market === "US" ? "$" : "¥"}
                        {selected.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{selected.name}</p>
                </div>
                <button
                  onClick={resetSelection}
                  className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-active"
                >
                  重新选择
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border-subtle pt-3">
                {selected.dividendYield && (
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">股息率</p>
                    <p className="text-sm font-bold text-primary">{selected.dividendYield}%</p>
                  </div>
                )}
                {selected.divYears && (
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">连续派息</p>
                    <p className="text-sm font-bold">{selected.divYears}年</p>
                  </div>
                )}
                {selected.frequency && (
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">派息频率</p>
                    <p className="text-sm font-bold">{selected.frequency === "monthly" ? "月度" : selected.frequency === "quarterly" ? "季度" : "半年"}</p>
                  </div>
                )}
              </div>
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
                  className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3.5 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
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
                  className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3.5 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="border-t border-border-subtle" />

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
                    className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3.5 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">建仓时间</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3.5 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border-subtle" />

            <div className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-subtle px-4 py-4">
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
                  drip ? "bg-[color:var(--success)]" : "bg-toggle-off",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 flex size-5 items-center justify-center rounded-full bg-white shadow-sm transition-all",
                    drip ? "left-[26px]" : "left-1",
                  )}
                >
                  <Repeat className="size-3 text-foreground" />
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

      <div className="fixed inset-x-0 bottom-0 border-t border-border-subtle bg-nav-bg pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex gap-3 px-5 pt-4">
          <button
            onClick={onBack}
            className="flex-1 rounded-xl border border-border-subtle py-3.5 text-sm font-medium text-muted-foreground hover:bg-surface-subtle"
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
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
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
