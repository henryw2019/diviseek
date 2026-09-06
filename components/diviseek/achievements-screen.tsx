"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Trophy, Flame, BookOpen, Bookmark, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAchievements } from "@/lib/api"

type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  target: number
}

type AchievementSummary = {
  unlockedCount: number
  totalCount: number
  totalMinutes: number
  totalArticles: number
  streak: number
  bookmarkCount: number
  holdingCount: number
}

export function AchievementsScreen({
  user,
  onLoginRequired,
  onBack,
}: {
  user?: { id: string; phone: string; nickname?: string | null }
  onLoginRequired?: () => void
  onBack: () => void
}) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [summary, setSummary] = useState<AchievementSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getAchievements()
      .then((data) => {
        setAchievements(data.achievements)
        setSummary(data.summary)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="min-h-screen px-5 pt-8 pb-6">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-full bg-surface-subtle"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">寻息成就</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-surface-subtle">
            <Trophy className="size-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-base font-medium text-foreground">登录后查看成就</p>
          <p className="mt-1 text-sm text-muted-foreground">登录后自动跟踪您的阅读与持仓数据</p>
          <button
            onClick={onLoginRequired}
            className="mt-6 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            立即登录
          </button>
        </div>
      ) : !summary ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground">加载失败，请重试</p>
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/20">
                <Trophy className="size-7 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {summary.unlockedCount}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / {summary.totalCount}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">已解锁成就</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <StatItem
                icon={<BookOpen className="size-4 text-primary" />}
                value={summary.totalArticles}
                label="篇文章"
              />
              <StatItem
                icon={<Flame className="size-4 text-primary" />}
                value={summary.streak}
                label="天连续"
              />
              <StatItem
                icon={<Bookmark className="size-4 text-primary" />}
                value={summary.bookmarkCount}
                label="篇收藏"
              />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">全部成就</h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-card/60 py-2.5">
      {icon}
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { title, description, icon, unlocked, progress, target } = achievement
  const pct = target > 0 ? Math.min(1, progress / target) : 0

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border p-4 transition-all",
        unlocked
          ? "border-primary/30 bg-card"
          : "border-border-subtle bg-card/60 opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("text-2xl", !unlocked && "grayscale")}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", unlocked ? "text-foreground" : "text-muted-foreground")}>
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground text-pretty">{description}</p>
        </div>
        {unlocked && (
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
            已解锁
          </span>
        )}
      </div>

      {!unlocked && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {progress} / {target}
            </span>
            <span>{Math.round(pct * 100)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
            <div
              className="h-full rounded-full bg-primary/40 transition-all duration-500"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
