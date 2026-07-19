"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X, Repeat, Wallet } from "lucide-react"
import { dividendEvents, type CalendarEvent } from "@/lib/diviseek-data"
import { formatCNY } from "./shared"
import { cn } from "@/lib/utils"
import { getCalendarEvents, getToken } from "@/lib/api"

const TODAY_ISO = "2026-07-13"
const weekdayCN = ["日", "一", "二", "三", "四", "五", "六"]

export function CalendarScreen({ user }: { user?: any }) {
  const [mode, setMode] = useState<"ex" | "pay">("ex")
  const [cursor, setCursor] = useState({ year: 2026, month: 6 })
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

  const activeEvents = user && realEvents.length > 0 ? realEvents : dividendEvents

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
    const startDay = first.getDay()
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const cells: ({ day: number; iso: string } | null)[] = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      cells.push({ day: d, iso })
    }
    return cells
  }, [cursor])

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

      <div className="mt-4 flex rounded-full border border-white/10 bg-card p-1">
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
        <button onClick={() => shift(-1)} className="flex size-9 items-center justify-center rounded-full bg-white/5">
          <ChevronLeft className="size-5" />
        </button>
        <h2 className="text-base font-semibold tabular-nums">{monthName}</h2>
        <button onClick={() => shift(1)} className="flex size-9 items-center justify-center rounded-full bg-white/5">
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
          const isToday = cell.iso === TODAY_ISO
          const hasConfirmed = evts?.some((e) => e.status === "confirmed")
          const hasEstimated = evts?.some((e) => e.status === "estimated")
          return (
            <button
              key={cell.iso}
              onClick={() => openDay(cell.iso)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                isToday ? "ring-2 ring-primary" : "",
                evts ? "bg-white/[0.04]" : "",
              )}
            >
              <span className={cn("tabular-nums", isToday ? "font-bold text-primary" : "text-foreground")}>
                {cell.day}
              </span>
              <span className="mt-1 flex h-1.5 items-center gap-0.5">
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
      </div>

      {sheet && (
        <BottomSheet date={sheetDate} events={sheet} mode={mode} onClose={() => setSheet(null)} />
      )}
    </div>
  )
}

function BottomSheet({
  date,
  events,
  mode,
  onClose,
}: {
  date: string
  events: CalendarEvent[]
  mode: "ex" | "pay"
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md items-end justify-center">
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-label="关闭" />
      <div className="relative z-10 w-full animate-[marquee-up_0.28s_ease-out] rounded-t-3xl border-t border-white/10 bg-card px-5 pb-28 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold tabular-nums">
            {date} · {mode === "ex" ? "除息" : "派息"}
          </h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-white/5">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <div key={e.ticker} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">{e.ticker}</span>
                  <span className="text-sm">{e.name}</span>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    e.status === "confirmed"
                      ? "bg-primary/15 text-primary"
                      : "bg-white/10 text-muted-foreground",
                  )}
                >
                  {e.status === "confirmed" ? "已确认" : "预估"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <Info label="每股" value={`¥${e.perShare}`} />
                <Info label="持有" value={`${e.shares} 股`} />
                <Info label="预计到账" value={formatCNY(e.total)} gold />
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
