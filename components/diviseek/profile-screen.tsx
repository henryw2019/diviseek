"use client"

import { useState } from "react"
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

export function ProfileScreen({
  user,
  onLogout,
}: {
  user?: { id: string; phone: string; nickname?: string | null }
  onLogout?: () => void
}) {
  return (
    <div className="min-h-screen px-5 pt-8 pb-6">
      {/* Top user */}
      <header className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30">
          <Compass className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">{user?.nickname || "寻息者"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {user?.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(7)}` : "加入寻息第 128 天"}
          </p>
        </div>
      </header>

      {/* Reading profile card */}
      <section className="mt-6 rounded-3xl border border-white/5 bg-card p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <ReadStat icon={BookOpen} value="24" unit="小时" label="累计阅读" />
          <ReadStat icon={Bookmark} value="15" unit="篇" label="收藏" />
          <ReadStat icon={Flame} value="7" unit="天" label="连续打卡" />
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-1 rounded-full bg-primary/10 py-2.5 text-sm font-medium text-primary">
          查看寻息成就 <ArrowRight className="size-4" />
        </button>
      </section>

      {/* Notifications */}
      <Section title="通知设置" icon={Bell}>
        <ToggleRow label="除息提醒" defaultOn />
        <ToggleRow label="派息到账" defaultOn />
        <ToggleRow label="文章更新" defaultOn={false} />
      </Section>

      {/* Data export */}
      <Section title="数据导出" icon={Download}>
        <LinkRow icon={FileText} label="2025 年度股息报告" hint="PDF" />
        <LinkRow icon={FileSpreadsheet} label="持仓数据备份" hint="CSV" />
      </Section>

      {/* App settings */}
      <Section title="应用设置" icon={Settings}>
        <NavRow label="货币单位" value="¥ CNY" />
        <NavRow label="股息税率" value="20%" />
        <NavRow label="主题" value="深色" />
        <NavRow label="日历起始" value="周日" />
      </Section>

      {/* Help */}
      <Section title="帮助中心" icon={CircleHelp}>
        <NavRow label="新手引导" />
        <NavRow label="常见问题" />
        <NavRow label="意见反馈" />
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
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-card">
        {children}
      </div>
    </section>
  )
}

function ToggleRow({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5 last:border-b-0">
      <span className="text-sm">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-white/15")}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  )
}

function LinkRow({
  icon: Icon,
  label,
  hint,
}: {
  icon: typeof FileText
  label: string
  hint: string
}) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3.5 text-left last:border-b-0">
      <Icon className="size-5 text-muted-foreground" />
      <span className="flex-1 text-sm">{label}</span>
      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">{hint}</span>
      <Download className="size-4 text-primary" />
    </button>
  )
}

function NavRow({ label, value }: { label: string; value?: string }) {
  return (
    <button className="flex w-full items-center justify-between border-b border-white/5 px-4 py-3.5 text-left last:border-b-0">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1.5">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="size-4 text-muted-foreground" />
      </span>
    </button>
  )
}
