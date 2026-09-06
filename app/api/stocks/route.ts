import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const market = searchParams.get("market") || "US"

  try {
    const stocks = await prisma.stock.findMany({
      where: {
        market,
        OR: q
          ? [
              { ticker: { contains: q.toUpperCase() } },
              { name: { contains: q } },
            ]
          : undefined,
      },
      select: {
        ticker: true,
        name: true,
        market: true,
        sector: true,
        price: true,
        dividendYield: true,
        frequency: true,
        dividendPerShare: true,
        exDate: true,
        divYears: true,
        marketCap: true,
      },
      orderBy: { marketCap: "desc" },
      take: 20,
    })

    return NextResponse.json({ success: true, data: { stocks } })
  } catch (error) {
    console.error("SearchStocks error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
