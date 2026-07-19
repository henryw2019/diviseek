import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "手机号和密码不能为空" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "手机号或密码错误" },
        { status: 401 }
      )
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "手机号或密码错误" },
        { status: 401 }
      )
    }

    const token = signToken({ userId: user.id, phone: user.phone })

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, phone: user.phone, nickname: user.nickname },
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试" },
      { status: 500 }
    )
  }
}
