import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    const upper = ticker.toUpperCase()

    const stock = await prisma.stock.findUnique({
      where: { ticker: upper },
      include: {
        dividendHistory: {
          orderBy: { exDate: "desc" },
          take: 20,
        },
      },
    })

    if (!stock) {
      return NextResponse.json({ success: false, error: "股票不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { stock } })
  } catch (error) {
    console.error("GetStock error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
