"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Flame,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Clock,
  BookOpen,
} from "lucide-react"
import {
  categories,
  type Article,
} from "@/lib/diviseek-data"
import { cn } from "@/lib/utils"
import { getArticles, getBookmarks, toggleBookmark } from "@/lib/api"

export function SchoolScreen({
  user,
  onLoginRequired,
}: {
  user?: { id: string; phone: string; nickname?: string | null }
  onLoginRequired?: () => void
}) {
  const router = useRouter()
  const [cat, setCat] = useState<string>("全部")
  const [query, setQuery] = useState("")
  const [marks, setMarks] = useState<Record<string, boolean>>({})
  const [articles, setArticles] = useState<Article[]>([])
  const [heroArticle, setHeroArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getArticles(cat, query)
        .then((data) => {
          setArticles(data.articles)
          setHeroArticle(data.heroArticle)
        })
        .catch(() => {
          setArticles([])
          setHeroArticle(null)
        })
        .finally(() => setLoading(false))
    }, query ? 300 : 0)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [cat, query])

  useEffect(() => {
    if (!user) return
    getBookmarks()
      .then((data) => {
        const map: Record<string, boolean> = {}
        for (const b of data.bookmarks) {
          map[b.articleId] = true
        }
        setMarks(map)
      })
      .catch(() => {})
  }, [user])

  const toggleMark = (id: string) => {
    if (!user) {
      onLoginRequired?.()
      return
    }
    setMarks((m) => ({ ...m, [id]: !m[id] }))
    toggleBookmark(id).catch(() => {
      setMarks((m) => ({ ...m, [id]: !m[id] }))
    })
  }

  const openArticle = (id: string) => {
    sessionStorage.setItem("schoolScrollY", String(window.scrollY))
    router.push(`/school/${id}`)
  }

  // Restore scroll position when returning from article
  useEffect(() => {
    if (!loading) {
      const saved = sessionStorage.getItem("schoolScrollY")
      if (saved) {
        sessionStorage.removeItem("schoolScrollY")
        requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)))
      }
    }
  }, [loading])

  const filtered = articles.filter((a) => {
    const matchCat = cat === "全部" || a.category === cat
    const matchQuery = !query || a.title.includes(query) || a.author.includes(query)
    return matchCat && matchQuery && !(cat === "全部" && heroArticle && a.id === heroArticle.id)
  })

  return (
    <div className="min-h-screen px-5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">寻息学堂</h1>
        <span className="text-[11px] text-muted-foreground">价值投资 · 精选</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索投资知识..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              cat === c ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <SchoolEmpty />
      ) : (
        <>
          {cat === "全部" && heroArticle && (
            <button
              onClick={() => openArticle(heroArticle.id)}
              className="group relative mt-5 block h-44 w-full overflow-hidden rounded-3xl text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-amber-500/20 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" /> 编辑精选
              </span>
              <div className="absolute inset-x-4 bottom-4">
                <h2 className="text-lg font-bold leading-snug text-balance">{heroArticle.title}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-foreground/70">
                  <Clock className="size-3" /> {heroArticle.readMinutes} 分钟
                </p>
              </div>
            </button>
          )}

          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">推荐阅读</h3>
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {filtered.slice(0, 3).map((a) => (
                <button
                  key={a.id}
                  onClick={() => openArticle(a.id)}
                  className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-border-subtle bg-card p-3 text-left"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {a.title.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {a.category} · {a.readMinutes} 分钟
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] p-4 text-primary-foreground">
            <Flame className="size-8 shrink-0" strokeWidth={2} />
            <div className="flex-1">
              <p className="text-sm font-bold">开启寻息之旅</p>
              <p className="text-[11px] opacity-80">阅读文章积累投资知识</p>
            </div>
          </section>

          <section className="mt-6 pb-4">
            <h3 className="mb-3 text-sm font-semibold">
              {cat === "全部" ? "全部内容" : cat}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((a, i) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  bookmarked={!!marks[a.id]}
                  onToggleMark={() => toggleMark(a.id)}
                  onOpen={() => openArticle(a.id)}
                  index={i}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function ArticleCard({
  article,
  bookmarked,
  onToggleMark,
  onOpen,
  index,
}: {
  article: Article
  bookmarked: boolean
  onToggleMark: () => void
  onOpen: () => void
  index?: number
}) {
  const gradients = [
    "from-primary/25 to-blue-500/15",
    "from-amber-500/25 to-orange-500/15",
    "from-emerald-500/25 to-teal-500/15",
    "from-rose-500/25 to-pink-500/15",
    "from-violet-500/25 to-purple-500/15",
    "from-cyan-500/25 to-sky-500/15",
  ]
  const grad = gradients[(index ?? 0) % gradients.length]

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card transition-transform hover:-translate-y-0.5">
      <button onClick={onOpen} className="relative block aspect-video w-full overflow-hidden text-left">
        <div className={cn("absolute inset-0 bg-gradient-to-br", grad)} />
        <div className="absolute inset-x-3 bottom-3">
          <span className="line-clamp-2 text-xs font-semibold text-foreground/80">{article.title}</span>
        </div>
      </button>
      <div className="p-3">
        <span className="text-[10px] font-medium text-primary">{article.category}</span>
        <button onClick={onOpen} className="mt-1 block text-left">
          <h4 className="line-clamp-2 text-[13px] font-semibold leading-snug">{article.title}</h4>
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
              {article.author.slice(0, 1)}
            </span>
            <span className="text-[10px] text-muted-foreground">{article.author}</span>
          </div>
          <button onClick={onToggleMark} aria-label="收藏">
            {bookmarked ? (
              <BookmarkCheck className="size-4 text-primary" />
            ) : (
              <Bookmark className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
          {article.readCount.toLocaleString("zh-CN")} 阅读
        </p>
      </div>
    </div>
  )
}

function SchoolEmpty() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
        <BookOpen className="size-11 text-primary" strokeWidth={1.4} />
      </div>
      <h2 className="text-base font-semibold">开启你的寻息之旅</h2>
      <p className="mt-1.5 text-sm text-muted-foreground text-pretty">
        没有找到相关内容，换个关键词或分类试试
      </p>
    </div>
  )
}
