import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

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

    const tickers = [...new Set(holdings.map((h) => h.ticker))]
    const stocks = await prisma.stock.findMany({
      where: { ticker: { in: tickers } },
      select: { ticker: true, price: true, dividendYield: true, divGrowth1y: true, marketCap: true, peRatio: true },
    })
    const stockMap = Object.fromEntries(stocks.map((s) => [s.ticker, s]))

    const enriched = holdings.map((h) => ({
      ...h,
      stock: stockMap[h.ticker] || null,
    }))

    const totalAnnual = holdings.reduce((sum, h) => sum + h.annualIncome, 0)
    const avgYield = holdings.length > 0
      ? holdings.reduce((sum, h) => sum + h.yield, 0) / holdings.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        holdings: enriched,
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
    const { ticker, name, shares, yield: yieldVal, frequency, nextExDate, annualIncome, drip, color, avgCost, purchaseDate, market } = body

    if (!ticker || !name || shares == null || yieldVal == null || !nextExDate || annualIncome == null) {
      return NextResponse.json({ success: false, error: "缺少必填字段" }, { status: 400 })
    }

    const holding = await prisma.holding.create({
      data: {
        userId,
        ticker: ticker.toUpperCase(),
        name,
        shares,
        yield: yieldVal,
        frequency: frequency || "annual",
        nextExDate,
        annualIncome,
        drip: drip ?? false,
        color: color || "#64748b",
        avgCost: avgCost ?? null,
        purchaseDate: purchaseDate ?? null,
        market: market || "US",
      },
    })

    return NextResponse.json({ success: true, data: { holding } })
  } catch (error) {
    console.error("CreateHolding error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
