"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronLeft, BookmarkCheck, Bookmark, Share2, Check, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getMe, toggleBookmark, saveReadingProgress } from "@/lib/api"

type Article = {
  id: string
  title: string
  category: string
  author: string
  readMinutes: number
  excerpt: string
  content: string
}

export function ArticleView({ article }: { article: Article }) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [read, setRead] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [user, setUser] = useState<any>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMe().then((data) => setUser(data.user)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    getMe().then((data) => setUser(data.user)).catch(() => {})
  }, [])

  const onScroll = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
  }, [])

  const handleBack = () => {
    router.push("/?tab=school")
  }

  const handleMarkRead = () => {
    if (!user) return
    const newRead = !read
    setRead(newRead)
    saveReadingProgress(article.id, newRead ? 1 : 0, newRead).catch(() => {
      setRead(read)
    })
  }

  const handleBookmark = () => {
    if (!user) return
    const newVal = !bookmarked
    setBookmarked(newVal)
    toggleBookmark(article.id).catch(() => {
      setBookmarked(bookmarked)
    })
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `推荐阅读：${article.title} —— 来自寻息 DiviSeek`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "寻息 DiviSeek", text, url })
        return
      } catch {}
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text + " " + url)
      } else {
        const ta = document.createElement("textarea")
        ta.value = text + " " + url
        ta.style.position = "fixed"
        ta.style.opacity = "0"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        document.body.removeChild(ta)
      }
      alert("分享链接已复制到剪贴板")
    } catch {}
  }

  const paragraphs = article.content
    ? article.content.split("\n\n").filter((p: string) => p.trim())
    : [article.excerpt]

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <div className="fixed inset-x-0 top-0 z-50 mx-auto h-0.5 max-w-md bg-transparent">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>

      <header className="flex items-center gap-3 px-5 pt-8 pb-3">
        <button onClick={handleBack} className="flex size-9 items-center justify-center rounded-full bg-surface-subtle">
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
          <Clock className="size-3" />
          <span>{article.readMinutes} 分钟</span>
        </div>

        <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-foreground">
          {paragraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md items-center gap-3 border-t border-border-subtle bg-nav-bg px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
        <button
          onClick={handleBookmark}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle"
          aria-label="收藏"
        >
          {bookmarked ? <BookmarkCheck className="size-5 text-primary" /> : <Bookmark className="size-5 text-muted-foreground" />}
        </button>
        <button
          onClick={handleShare}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-subtle"
          aria-label="分享"
        >
          <Share2 className="size-5 text-muted-foreground" />
        </button>
        {user ? (
          <button
            onClick={handleMarkRead}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors",
              read ? "bg-[color:var(--success)] text-white" : "bg-primary text-primary-foreground",
            )}
          >
            <Check className="size-4" />
            {read ? "已读完" : "标记为已读"}
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            打开 App 阅读
          </button>
        )}
      </div>
    </div>
  )
}
