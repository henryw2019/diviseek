import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "登录已过期" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
