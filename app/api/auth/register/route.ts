import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, nickname } = body

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "手机号和密码不能为空" },
        { status: 400 }
      )
    }

    if (!/^1\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "手机号格式不正确" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少6位" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "该手机号已注册" },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { phone, password: hashedPassword, nickname: nickname || null },
      select: { id: true, phone: true, nickname: true },
    })

    const token = signToken({ userId: user.id, phone: user.phone })

    return NextResponse.json({ success: true, data: { user, token } })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试" },
      { status: 500 }
    )
  }
}
