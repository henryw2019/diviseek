import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    const upper = ticker.toUpperCase()

    const prices = await prisma.priceHistory.findMany({
      where: { ticker: upper },
      orderBy: { date: "desc" },
      take: 52,
      select: { date: true, close: true, change: true },
    })

    return NextResponse.json({ success: true, data: { ticker: upper, prices } })
  } catch (error) {
    console.error("GetPrices error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
