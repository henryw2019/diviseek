import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractUserId } from "@/lib/with-auth"

type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
}

export async function GET(request: NextRequest) {
  try {
    const userId = extractUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const readings = await prisma.userReading.findMany({
      where: { userId },
      include: { article: { select: { readMinutes: true } } },
    })

    const bookmarkCount = await prisma.userBookmark.count({ where: { userId } })
    const holdingCount = await prisma.holding.count({ where: { userId } })

    const completed = readings.filter((r) => r.completed)
    const totalMinutes = completed.reduce((sum, r) => sum + r.article.readMinutes, 0)
    const totalArticles = completed.length

    const readingDays = new Set(
      completed.map((r) => r.readAt.toISOString().slice(0, 10))
    )
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (readingDays.has(d.toISOString().slice(0, 10))) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    const achievements: Achievement[] = [
      {
        id: "first-read",
        title: "初窥门径",
        description: "完成第一篇文章阅读",
        icon: "📖",
        unlocked: totalArticles >= 1,
        progress: Math.min(totalArticles, 1),
        target: 1,
      },
      {
        id: "read-5",
        title: "勤学不辍",
        description: "累计阅读 5 篇文章",
        icon: "📚",
        unlocked: totalArticles >= 5,
        progress: Math.min(totalArticles, 5),
        target: 5,
      },
      {
        id: "read-10",
        title: "博览群书",
        description: "累计阅读 10 篇文章",
        icon: "🎓",
        unlocked: totalArticles >= 10,
        progress: Math.min(totalArticles, 10),
        target: 10,
      },
      {
        id: "read-30",
        title: "学富五车",
        description: "累计阅读 30 篇文章",
        icon: "🏆",
        unlocked: totalArticles >= 30,
        progress: Math.min(totalArticles, 30),
        target: 30,
      },
      {
        id: "hour-1",
        title: "时间旅人",
        description: "累计阅读时长达到 1 小时",
        icon: "⏰",
        unlocked: totalMinutes >= 60,
        progress: Math.min(totalMinutes, 60),
        target: 60,
      },
      {
        id: "hour-5",
        title: "沉浸其中",
        description: "累计阅读时长达到 5 小时",
        icon: "⏳",
        unlocked: totalMinutes >= 300,
        progress: Math.min(totalMinutes, 300),
        target: 300,
      },
      {
        id: "streak-3",
        title: "三日之约",
        description: "连续 3 天阅读",
        icon: "🔥",
        unlocked: streak >= 3,
        progress: Math.min(streak, 3),
        target: 3,
      },
      {
        id: "streak-7",
        title: "一周坚持",
        description: "连续 7 天阅读",
        icon: "💪",
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        target: 7,
      },
      {
        id: "streak-30",
        title: "持之以恒",
        description: "连续 30 天阅读",
        icon: "🌟",
        unlocked: streak >= 30,
        progress: Math.min(streak, 30),
        target: 30,
      },
      {
        id: "bookmark-3",
        title: "收藏达人",
        description: "收藏 3 篇文章",
        icon: "🔖",
        unlocked: bookmarkCount >= 3,
        progress: Math.min(bookmarkCount, 3),
        target: 3,
      },
      {
        id: "first-holding",
        title: "持仓入门",
        description: "添加第一笔持仓",
        icon: "💰",
        unlocked: holdingCount >= 1,
        progress: Math.min(holdingCount, 1),
        target: 1,
      },
      {
        id: "holdings-5",
        title: "组合构建",
        description: "持有 5 只以上股票",
        icon: "📊",
        unlocked: holdingCount >= 5,
        progress: Math.min(holdingCount, 5),
        target: 5,
      },
    ]

    const unlockedCount = achievements.filter((a) => a.unlocked).length

    return NextResponse.json({
      success: true,
      data: {
        achievements,
        summary: {
          unlockedCount,
          totalCount: achievements.length,
          totalMinutes,
          totalArticles,
          streak,
          bookmarkCount,
          holdingCount,
        },
      },
    })
  } catch (error) {
    console.error("GetAchievements error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
