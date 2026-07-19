"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function TickerBadge({
  ticker,
  color,
  className,
}: {
  ticker: string
  color: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-xs font-bold tracking-tight text-white",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {ticker.slice(0, 4)}
    </div>
  )
}

export function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

export function formatCNY(n: number) {
  return "¥" + n.toLocaleString("zh-CN")
}

export function ProgressRing({
  progress,
  size = 52,
  stroke = 4,
  children,
}: {
  progress: number
  size?: number
  stroke?: number
  children?: React.ReactNode
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - progress)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
