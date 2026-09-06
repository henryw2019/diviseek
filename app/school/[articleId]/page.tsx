import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ArticleView } from "@/components/diviseek/article-view"

type Props = {
  params: Promise<{ articleId: string }>
}

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({ select: { id: true } })
  return articles.map((a) => ({ articleId: a.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleId } = await params
  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) return { title: "文章未找到" }
  return {
    title: `${article.title} — 寻息 DiviSeek`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      siteName: "寻息 DiviSeek",
      authors: [article.author],
      publishedTime: article.createdAt.toISOString(),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { articleId } = await params
  const article = await prisma.article.findUnique({ where: { id: articleId } })
  if (!article) notFound()

  return <ArticleView article={article} />
}
