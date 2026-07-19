"use client"

import { useEffect, useRef, useState } from "react"
import {
  Search,
  Flame,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  ChevronLeft,
  Sparkles,
  Clock,
  BookOpen,
} from "lucide-react"
import {
  categories,
  type Article,
} from "@/lib/diviseek-data"
import { ProgressRing } from "./shared"
import { cn } from "@/lib/utils"
import { getArticles } from "@/lib/api"

export function SchoolScreen() {
  const [cat, setCat] = useState<string>("全部")
  const [query, setQuery] = useState("")
  const [reading, setReading] = useState<Article | null>(null)
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

  const toggleMark = (id: string) => setMarks((m) => ({ ...m, [id]: !m[id] }))

  if (reading) {
    return (
      <ArticleReader
        article={reading}
        bookmarked={!!marks[reading.id]}
        onToggleMark={() => toggleMark(reading.id)}
        onBack={() => setReading(null)}
      />
    )
  }

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
              onClick={() => setReading(heroArticle)}
              className="group relative mt-5 block h-44 w-full overflow-hidden rounded-3xl text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-amber-500/20 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" /> 编辑精选
              </span>
              <div className="absolute inset-x-4 bottom-4">
                <h2 className="text-lg font-bold leading-snug text-balance">{heroArticle.title}</h2>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/70">
                  <Clock className="size-3" /> {heroArticle.readMinutes} 分钟
                </p>
              </div>
            </button>
          )}

          <section className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">继续阅读</h3>
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {filtered.slice(0, 2).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setReading(a)}
                  className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border border-white/5 bg-card p-3 text-left"
                >
                  <ProgressRing progress={0.3} size={48} stroke={4}>
                    <span className="text-[10px] font-bold text-primary tabular-nums">30%</span>
                  </ProgressRing>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      已读 30%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] p-4 text-[#0f172a]">
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
                  onOpen={() => setReading(a)}
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
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-card transition-transform hover:-translate-y-0.5">
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

function ArticleReader({
  article,
  bookmarked,
  onToggleMark,
  onBack,
}: {
  article: Article & { content?: string }
  bookmarked: boolean
  onToggleMark: () => void
  onBack: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [read, setRead] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
  }

  const content = (article as any).content
  const paragraphs = content
    ? content.split("\n\n").filter((p: string) => p.trim())
    : [
        article.excerpt,
        "股息投资的核心，不在于追逐一时的高收益率，而在于寻找那些能够持续、稳定并不断增长现金流的优质企业。真正的复利魔法，来自时间与纪律的结合。",
        "当你把注意力从价格波动转向企业的分红能力时，市场的喧嚣便不再重要。每一次再投资，都是在为未来的现金流播种。",
        "衡量一家公司的分红可持续性，最重要的指标是自由现金流与派息率。当派息率长期低于自由现金流时，股息的护城河才足够深厚。",
        "寻息，不只是寻找收益，更是寻找一种与时间做朋友的心智。让复利在你熟睡时继续工作，这便是价值投资最朴素也最强大的秘密。",
      ]

  return (
    <div className="relative flex h-screen flex-col">
      <div className="fixed inset-x-0 top-0 z-50 mx-auto h-0.5 max-w-md bg-transparent">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>

      <header className="flex items-center gap-3 px-5 pt-8 pb-3">
        <button onClick={onBack} className="flex size-9 items-center justify-center rounded-full bg-white/5">
          <ChevronLeft className="size-5" />
        </button>
        <span className="text-xs text-muted-foreground">{article.category}</span>
      </header>

      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex-1 overflow-y-auto px-5 pb-48">
        <h1 className="text-2xl font-bold leading-tight text-balance">{article.title}</h1>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {article.author.slice(0, 1)}
          </span>
          <span>{article.author}</span>
          <span>·</span>
          <span>{article.readMinutes} 分钟</span>
        </div>

        <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-slate-300">
          {paragraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-40 mx-auto flex max-w-md items-center gap-3 border-t border-white/5 bg-[#0f172a]/95 px-5 pb-3 pt-3 backdrop-blur-xl">
        <button
          onClick={onToggleMark}
          className="flex size-11 items-center justify-center rounded-full bg-white/5"
          aria-label="收藏"
        >
          {bookmarked ? <BookmarkCheck className="size-5 text-primary" /> : <Bookmark className="size-5" />}
        </button>
        <button className="flex size-11 items-center justify-center rounded-full bg-white/5" aria-label="分享">
          <Share2 className="size-5" />
        </button>
        <button
          onClick={() => setRead((r) => !r)}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors",
            read ? "bg-[color:var(--success)] text-white" : "bg-primary text-primary-foreground",
          )}
        >
          <Check className="size-4" />
          {read ? "已读完" : "标记为已读"}
        </button>
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
