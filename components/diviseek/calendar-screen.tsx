"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X, Repeat, Wallet } from "lucide-react"
import { dividendEvents, type CalendarEvent } from "@/lib/diviseek-data"
import { formatCurrency } from "./shared"
import { cn } from "@/lib/utils"
import { getCalendarEvents, getToken } from "@/lib/api"
import { useSettings } from "@/lib/settings-context"

const weekdayCN_SUN = ["日", "一", "二", "三", "四", "五", "六"]
const weekdayCN_MON = ["一", "二", "三", "四", "五", "六", "日"]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function CalendarScreen({ user }: { user?: any }) {
  const { currency, calendarStart } = useSettings()
  const weekdayCN = calendarStart === "monday" ? weekdayCN_MON : weekdayCN_SUN
  const [mode, setMode] = useState<"ex" | "pay">("ex")
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [sheet, setSheet] = useState<CalendarEvent[] | null>(null)
  const [sheetDate, setSheetDate] = useState<string>("")
  const [realEvents, setRealEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    if (!user) {
      setRealEvents([])
      return
    }
    const token = getToken()
    if (!token) return
    getCalendarEvents()
      .then((data) => setRealEvents(data.events))
      .catch(() => setRealEvents([]))
  }, [user])

  const activeEvents = user ? realEvents : dividendEvents

  const eventMap = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>()
    for (const e of activeEvents) {
      const arr = m.get(e.date) ?? []
      arr.push(e)
      m.set(e.date, arr)
    }
    return m
  }, [activeEvents])

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1)
    let startDay = first.getDay()
    if (calendarStart === "monday") {
      startDay = startDay === 0 ? 6 : startDay - 1
    }
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const cells: ({ day: number; iso: string } | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      cells.push({ day: d, iso })
    }
    return cells
  }, [cursor, calendarStart])

  const monthName = `${cursor.year}年${cursor.month + 1}月`

  const shift = (dir: number) => {
    setCursor((c) => {
      const m = c.month + dir
      if (m < 0) return { year: c.year - 1, month: 11 }
      if (m > 11) return { year: c.year + 1, month: 0 }
      return { ...c, month: m }
    })
  }

  const openDay = (iso: string) => {
    const evts = eventMap.get(iso)
    if (evts && evts.length) {
      setSheet(evts)
      setSheetDate(iso)
    }
  }

  return (
    <div className="min-h-screen px-5 pt-8">
      <h1 className="text-lg font-bold">股息日历</h1>

      <div className="mt-4 flex rounded-full border border-border-subtle bg-card p-1">
        {(["ex", "pay"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {m === "ex" ? "除息日" : "派息日"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => shift(-1)} className="flex size-9 items-center justify-center rounded-full bg-surface-subtle">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-base font-semibold tabular-nums">{monthName}</h2>
        <button onClick={() => shift(1)} className="flex size-9 items-center justify-center rounded-full bg-surface-subtle">
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {weekdayCN.map((w) => (
          <div key={w} className="py-1 text-center text-[11px] text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} />
          const evts = eventMap.get(cell.iso)
          const isToday = cell.iso === todayISO()
          const hasConfirmed = evts?.some((e) => e.status === "confirmed")
          const hasEstimated = evts?.some((e) => e.status === "estimated")
          const hasHistorical = evts?.some((e) => (e as any).historical)
          return (
            <button
              key={cell.iso}
              onClick={() => openDay(cell.iso)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                isToday ? "ring-2 ring-primary" : "",
                evts ? "bg-surface-subtle/50" : "",
              )}
            >
              <span className={cn("tabular-nums", isToday ? "font-bold text-primary" : "text-foreground")}>
                {cell.day}
              </span>
              <span className="mt-1 flex h-1.5 items-center gap-0.5">
                {hasHistorical && <span className="size-1.5 rounded-full bg-[color:var(--success)]" />}
                {hasConfirmed && <span className="size-1.5 rounded-full bg-primary shadow-[0_0_6px] shadow-primary/60" />}
                {hasEstimated && <span className="size-1.5 rounded-full bg-muted-foreground" />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" /> 已确认派息
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground" /> 预估派息
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[color:var(--success)]" /> 历史派息
        </span>
      </div>

      {sheet && (
        <BottomSheet date={sheetDate} events={sheet} mode={mode} onClose={() => setSheet(null)} currency={currency} />
      )}
    </div>
  )
}

function BottomSheet({
  date,
  events,
  mode,
  onClose,
  currency,
}: {
  date: string
  events: CalendarEvent[]
  mode: "ex" | "pay"
  onClose: () => void
  currency: string
}) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end justify-center">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative z-10 flex max-h-[78vh] w-full flex-col rounded-t-3xl border-t border-border-subtle bg-card px-5 pb-8 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-surface-hover" />
        <div className="mb-3 flex shrink-0 items-center justify-between">
          <h3 className="text-base font-semibold tabular-nums">
            {date} · {mode === "ex" ? "除息" : "派息"} · {events.length} 支
          </h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-surface-subtle">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto overscroll-contain pr-1">
          {events.map((e) => (
            <div key={e.ticker} className="rounded-2xl border border-border-subtle bg-surface-subtle/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{e.ticker}</span>
                  <span className="text-sm">{e.name}</span>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    (e as any).historical
                      ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                      : e.status === "confirmed"
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-hover text-muted-foreground",
                  )}
                >
                  {(e as any).historical ? "已完成" : e.status === "confirmed" ? "已确认" : "预估"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <Info label="每股" value={`$${e.perShare}`} />
                <Info label="持有" value={`${e.shares} 股`} />
                <Info label="预计到账" value={formatCurrency(e.total, currency)} gold />
                <div>
                  <p className="text-[11px] text-muted-foreground">方式</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium">
                    {e.method === "drip" ? (
                      <><Repeat className="size-3.5 text-[color:var(--success)]" /> 再投资</>
                    ) : (
                      <><Wallet className="size-3.5 text-primary" /> 现金</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-semibold tabular-nums", gold && "text-primary")}>{value}</p>
    </div>
  )
}
