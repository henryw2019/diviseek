import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}
    if (category && category !== "全部") {
      where.category = category
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
      ]
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: [
        { isHero: "desc" },
        { readCount: "desc" },
      ],
    })

    const heroArticle = articles.find((a) => a.isHero) || null

    return NextResponse.json({
      success: true,
      data: { articles, heroArticle },
    })
  } catch (error) {
    console.error("GetArticles error:", error)
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 })
  }
}
