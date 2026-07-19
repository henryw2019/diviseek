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

    let settings = await prisma.userSettings.findUnique({ where: { userId } })
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      })
    }

    return NextResponse.json({ success: true, data: { settings } })
  } catch (error) {
    console.error("GetSettings error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const data: Record<string, any> = {}
    const allowed = ["currency", "taxRate", "theme", "calendarStart", "notifyExDate", "notifyDividendPay", "notifyArticle"]
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })

    return NextResponse.json({ success: true, data: { settings } })
  } catch (error) {
    console.error("UpdateSettings error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
