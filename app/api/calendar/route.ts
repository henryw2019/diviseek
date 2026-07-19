import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

function extractUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  const payload = verifyToken(token)
  return payload?.userId || null
}

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
    })

    const events: any[] = []
    const now = new Date()
    const oneYearLater = new Date(now)
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

    for (const h of holdings) {
      const mult = frequencyMultiplier[h.frequency] || 4
      const intervalDays = Math.round(365 / mult)
      const baseDate = new Date(h.nextExDate)

      for (let i = 0; i < mult + 1; i++) {
        const eventDate = new Date(baseDate)
        eventDate.setDate(eventDate.getDate() + intervalDays * i)
        if (eventDate < now || eventDate > oneYearLater) continue

        const iso = eventDate.toISOString().slice(0, 10)
        const perShare = h.annualIncome / (h.shares * mult)
        events.push({
          date: iso,
          ticker: h.ticker,
          name: h.name,
          perShare: Math.round(perShare * 1000) / 1000,
          shares: h.shares,
          total: Math.round(perShare * h.shares),
          status: i === 0 ? "confirmed" : "estimated",
          method: h.drip ? "drip" : "cash",
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
