import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const bookmarks = await prisma.userBookmark.findMany({
      where: { userId },
      select: { articleId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: { bookmarks } })
  } catch (error) {
    console.error("GetBookmarks error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json({ success: false, error: "缺少 articleId" }, { status: 400 })
    }

    const existing = await prisma.userBookmark.findUnique({
      where: { userId_articleId: { userId, articleId } },
    })

    if (existing) {
      await prisma.userBookmark.delete({
        where: { userId_articleId: { userId, articleId } },
      })
      return NextResponse.json({ success: true, data: { bookmarked: false } })
    }

    await prisma.userBookmark.create({
      data: { userId, articleId },
    })

    return NextResponse.json({ success: true, data: { bookmarked: true } })
  } catch (error) {
    console.error("ToggleBookmark error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
