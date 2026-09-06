import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, nickname: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, data: { user } })
  } catch (error) {
    console.error("GetMe error:", error)
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    )
  }
}
