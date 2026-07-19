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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const holding = await prisma.holding.findFirst({
      where: { id, userId },
    })

    if (!holding) {
      return NextResponse.json({ success: false, error: "持仓不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { holding } })
  } catch (error) {
    console.error("GetHolding error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.holding.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "持仓不存在" }, { status: 404 })
    }

    const body = await request.json()
    const { ticker, name, shares, yield: yieldVal, frequency, nextExDate, annualIncome, drip, color } = body

    const holding = await prisma.holding.update({
      where: { id },
      data: {
        ...(ticker !== undefined && { ticker: ticker.toUpperCase() }),
        ...(name !== undefined && { name }),
        ...(shares !== undefined && { shares }),
        ...(yieldVal !== undefined && { yield: yieldVal }),
        ...(frequency !== undefined && { frequency }),
        ...(nextExDate !== undefined && { nextExDate }),
        ...(annualIncome !== undefined && { annualIncome }),
        ...(drip !== undefined && { drip }),
        ...(color !== undefined && { color }),
      },
    })

    return NextResponse.json({ success: true, data: { holding } })
  } catch (error) {
    console.error("UpdateHolding error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.holding.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: "持仓不存在" }, { status: 404 })
    }

    await prisma.holding.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error("DeleteHolding error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
