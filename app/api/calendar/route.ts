import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

const frequencyMultiplier: Record<string, number> = {
  monthly: 12,
  quarterly: 4,
  "semi-annual": 2,
  annual: 1,
}

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const holdings = await prisma.holding.findMany({
      where: { userId },
      select: { ticker: true, name: true, shares: true, annualIncome: true, frequency: true, nextExDate: true, drip: true },
    })

    const tickers = holdings.map((h) => h.ticker)

    // Past dividend history (up to 1 year back)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const historicalDividends = await prisma.dividendHistory.findMany({
      where: {
        ticker: { in: tickers },
        exDate: { gte: oneYearAgo.toISOString().slice(0, 10) },
      },
      orderBy: { exDate: "desc" },
    })
    const divByTicker = new Map<string, typeof historicalDividends>()
    for (const d of historicalDividends) {
      const arr = divByTicker.get(d.ticker) ?? []
      arr.push(d)
      divByTicker.set(d.ticker, arr)
    }

    const events: any[] = []
    const now = new Date()
    const oneYearLater = new Date(now)
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    for (const h of holdings) {
      // Add historical dividend events
      const histDivs = divByTicker.get(h.ticker) || []
      for (const d of histDivs) {
        events.push({
          date: d.exDate,
          ticker: h.ticker,
          name: h.name,
          perShare: d.amount,
          shares: h.shares,
          total: Math.round(d.amount * h.shares),
          status: "confirmed" as const,
          method: h.drip ? "drip" as const : "cash" as const,
          historical: true,
        })
      }

      // Add future projected events
      const mult = frequencyMultiplier[h.frequency] || 4
      const intervalDays = Math.round(365 / mult)
      const baseDate = new Date(h.nextExDate)

      for (let i = 0; i < mult + 1; i++) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + intervalDays * i)
        if (eventDate <= now || eventDate > oneYearLater) continue

        const iso = eventDate.toISOString().slice(0, 10)
        const perShare = h.annualIncome / (h.shares * mult)
        events.push({
          date: iso,
          ticker: h.ticker,
          name: h.name,
          perShare: Math.round(perShare * 1000) / 1000,
          shares: h.shares,
          total: Math.round(perShare * h.shares),
          status: i === 0 ? "confirmed" as const : "estimated" as const,
          method: h.drip ? "drip" as const : "cash" as const,
          historical: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: { events },
    })
  } catch (error) {
    console.error("GetCalendar error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
