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

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const holdings = await prisma.holding.findMany({
      where: { userId },
      orderBy: { annualIncome: "desc" },
    })

    const totalAnnual = holdings.reduce((sum, h) => sum + h.annualIncome, 0)
    const avgYield = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + h.yield, 0) / holdings.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        holdings,
        summary: {
          annualIncome: totalAnnual,
          monthlyAverage: Math.round(totalAnnual / 12),
          holdingsCount: holdings.length,
          averageYield: Math.round(avgYield * 10) / 10,
        },
      },
    })
  } catch (error) {
    console.error("GetHoldings error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { ticker, name, shares, yield: yieldVal, frequency, nextExDate, annualIncome, drip, color } = body

    if (!ticker || !name || shares == null || yieldVal == null || !frequency || !nextExDate || annualIncome == null) {
      return NextResponse.json({ success: false, error: "缺少必填字段" }, { status: 400 })
    }

    const holding = await prisma.holding.create({
      data: {
        userId,
        ticker: ticker.toUpperCase(),
        name,
        shares,
        yield: yieldVal,
        frequency,
        nextExDate,
        annualIncome,
        drip: drip ?? false,
        color: color || "#64748b",
      },
    })

    return NextResponse.json({ success: true, data: { holding } })
  } catch (error) {
    console.error("CreateHolding error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
