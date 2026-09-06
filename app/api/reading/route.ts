import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const readings = await prisma.userReading.findMany({
      where: { userId },
      include: { article: { select: { readMinutes: true, category: true } } },
    })

    const completedReadings = readings.filter((r) => r.completed)
    const totalMinutes = completedReadings.reduce((sum, r) => sum + r.article.readMinutes, 0)
    const totalArticles = completedReadings.length

    const readingDays = new Set(
      completedReadings.map((r) => r.readAt.toISOString().slice(0, 10))
    )
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (readingDays.has(key)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalMinutes,
        totalArticles,
        streak,
        readings: readings.map((r) => ({
          articleId: r.articleId,
          progress: r.progress,
          completed: r.completed,
          readAt: r.readAt,
        })),
      },
    })
  } catch (error) {
    console.error("GetReadingStats error:", error)
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
    const { articleId, progress, completed } = body

    if (!articleId) {
      return NextResponse.json({ success: false, error: "缺少 articleId" }, { status: 400 })
    }

    const reading = await prisma.userReading.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {
        ...(progress !== undefined && { progress: Math.min(1, Math.max(0, progress)) }),
        ...(completed !== undefined && { completed }),
      },
      create: {
        userId,
        articleId,
        progress: progress ?? 0,
        completed: completed ?? false,
      },
    })

    return NextResponse.json({ success: true, data: { reading } })
  } catch (error) {
    console.error("SaveReading error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
