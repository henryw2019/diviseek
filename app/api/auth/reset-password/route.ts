import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, newPassword } = body

    if (!phone || !newPassword) {
      return NextResponse.json(
        { success: false, error: "手机号和新密码不能为空" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少6位" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { phone } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "该手机号未注册" },
        { status: 404 }
      )
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true, data: { message: "密码已重置" } })
  } catch (error) {
    console.error("ResetPassword error:", error)
    return NextResponse.json(
      { success: false, error: "服务器错误，请稍后重试" },
      { status: 500 }
    )
  }
}
