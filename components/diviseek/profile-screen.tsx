"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  Bookmark,
  Flame,
  ArrowRight,
  Bell,
  Download,
  FileText,
  FileSpreadsheet,
  Settings,
  CircleHelp,
  ChevronRight,
  Compass,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings, updateSettings, getReadingStats } from "@/lib/api"

export function ProfileScreen({
  user,
  onLogout,
  onLoginRequired,
  onSettingsChange,
  onAchievements,
}: {
  user?: { id: string; phone: string; nickname?: string | null }
  onLogout?: () => void
  onLoginRequired?: () => void
  onSettingsChange?: (patch: Record<string, any>) => void
  onAchievements?: () => void
}) {
  const [settings, setSettings] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalMinutes: number; totalArticles: number; streak: number } | null>(null)

  useEffect(() => {
    if (!user) return
    getSettings()
      .then((data) => setSettings(data.settings))
      .catch(() => {})
    getReadingStats()
      .then((data) => setStats({ totalMinutes: data.totalMinutes, totalArticles: data.totalArticles, streak: data.streak }))
      .catch(() => {})
  }, [user])

  const save = (patch: Record<string, any>) => {
    setSettings((s: any) => ({ ...s, ...patch }))
    onSettingsChange?.(patch)
    updateSettings(patch).catch(() => {})
  }

  const cycleCurrency = () => {
    const order = ["CNY", "USD", "HKD"]
    const labels: Record<string, string> = { CNY: "¥ CNY", USD: "$ USD", HKD: "HK$ HKD" }
    const next = order[(order.indexOf(settings?.currency || "CNY") + 1) % order.length]
    save({ currency: next })
  }

  const cycleTaxRate = () => {
    const order = [0, 10, 20, 25]
    const next = order[(order.indexOf(settings?.taxRate ?? 20) + 1) % order.length]
    save({ taxRate: next })
  }

  const cycleTheme = () => {
    const next = settings?.theme === "dark" ? "light" : "dark"
    save({ theme: next })
  }

  const cycleCalendarStart = () => {
    const next = settings?.calendarStart === "sunday" ? "monday" : "sunday"
    save({ calendarStart: next })
  }

  const currencyLabels: Record<string, string> = { CNY: "¥ CNY", USD: "$ USD", HKD: "HK$ HKD" }
  const themeLabels: Record<string, string> = { dark: "深色", light: "浅色" }
  const calLabels: Record<string, string> = { sunday: "周日", monday: "周一" }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="min-h-screen px-5 pt-8 pb-6">
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-card px-4 py-2 text-sm text-foreground shadow-lg border border-border-subtle animate-[marquee-up_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30">
          <Compass className="size-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{user?.nickname || "寻息者"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {user?.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(7)}` : "登录后数据将同步保存"}
          </p>
        </div>
        {!user && onLoginRequired && (
          <button
            onClick={onLoginRequired}
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-[#0f172a]"
          >
            登录
          </button>
        )}
      </header>

      <section className="mt-6 rounded-3xl border border-border-subtle bg-card p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <ReadStat icon={BookOpen} value={stats ? String(Math.round(stats.totalMinutes / 60 * 10) / 10) : "0"} unit="小时" label="累计阅读" />
          <ReadStat icon={Bookmark} value={stats ? String(stats.totalArticles) : "0"} unit="篇" label="已读文章" />
          <ReadStat icon={Flame} value={stats ? String(stats.streak) : "0"} unit="天" label="连续打卡" />
        </div>
        {onAchievements && (
          <button
            onClick={onAchievements}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-full bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            查看寻息成就 <ArrowRight className="size-4" />
          </button>
        )}
      </section>

      <Section title="通知设置" icon={Bell}>
        <ToggleRow
          label="除息提醒"
          on={settings?.notifyExDate ?? true}
          onToggle={() => save({ notifyExDate: !(settings?.notifyExDate ?? true) })}
        />
        <ToggleRow
          label="派息到账"
          on={settings?.notifyDividendPay ?? true}
          onToggle={() => save({ notifyDividendPay: !(settings?.notifyDividendPay ?? true) })}
        />
        <ToggleRow
          label="文章更新"
          on={settings?.notifyArticle ?? false}
          onToggle={() => save({ notifyArticle: !(settings?.notifyArticle ?? false) })}
        />
      </Section>

      <Section title="数据导出" icon={Download}>
        <button
          onClick={() => showToast("即将上线")}
          className="flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3.5 text-left last:border-b-0"
        >
          <FileText className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm">年度股息报告</span>
          <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] text-muted-foreground">PDF</span>
          <Download className="size-4 text-primary" />
        </button>
        <button
          onClick={() => showToast("即将上线")}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left last:border-b-0"
        >
          <FileSpreadsheet className="size-5 text-muted-foreground" />
          <span className="flex-1 text-sm">持仓数据备份</span>
          <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] text-muted-foreground">CSV</span>
          <Download className="size-4 text-primary" />
        </button>
      </Section>

      <Section title="应用设置" icon={Settings}>
        <NavRow label="货币单位" value={currencyLabels[settings?.currency || "CNY"]} onClick={cycleCurrency} />
        <NavRow label="股息税率" value={`${settings?.taxRate ?? 20}%`} onClick={cycleTaxRate} />
        <NavRow label="主题" value={themeLabels[settings?.theme || "dark"]} onClick={cycleTheme} />
        <NavRow label="日历起始" value={calLabels[settings?.calendarStart || "sunday"]} onClick={cycleCalendarStart} />
      </Section>

      <Section title="帮助中心" icon={CircleHelp}>
        <NavRow label="新手引导" onClick={() => showToast("新手引导功能即将上线")} />
        <NavRow label="常见问题" onClick={() => showToast("常见问题功能即将上线")} />
        <NavRow label="意见反馈" onClick={() => showToast("感谢您的反馈，功能即将上线")} />
      </Section>

      <p className="mt-6 text-center text-xs text-muted-foreground">DiviSeek 寻息 · v1.0.0</p>

      {onLogout && (
        <button
          onClick={onLogout}
          className="mt-4 w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
        >
          退出登录
        </button>
      )}
    </div>
  )
}

function ReadStat({
  icon: Icon,
  value,
  unit,
  label,
}: {
  icon: typeof BookOpen
  value: string
  unit: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon className="size-5 text-primary" />
      <p className="mt-2 text-lg font-bold tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Bell
  children: React.ReactNode
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-semibold">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-card">
        {children}
      </div>
    </section>
  )
}

function ToggleRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3.5 last:border-b-0">
      <span className="text-sm">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn("relative h-6 w-11 rounded-full border transition-colors", on ? "border-primary bg-primary" : "border-border-subtle bg-toggle-off")}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  )
}

function NavRow({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-border-subtle px-4 py-3.5 text-left last:border-b-0"
    >
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1.5">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="size-4 text-muted-foreground" />
      </span>
    </button>
  )
}
