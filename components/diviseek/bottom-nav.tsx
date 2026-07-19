"use client"

import { House, Layers, Calendar, GraduationCap, User } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabKey = "home" | "holdings" | "calendar" | "school" | "profile"

const tabs: { key: TabKey; label: string; icon: typeof House }[] = [
  { key: "home", label: "首页", icon: House },
  { key: "holdings", label: "持仓", icon: Layers },
  { key: "calendar", label: "日历", icon: Calendar },
  { key: "school", label: "寻息学堂", icon: GraduationCap },
  { key: "profile", label: "我的", icon: User },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey
  onChange: (key: TabKey) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-white/5 bg-[#0f172a]/90 backdrop-blur-xl">
      <ul className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-xl py-1.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className="size-5 transition-transform"
                  strokeWidth={isActive ? 2.4 : 1.8}
                  style={isActive ? { transform: "translateY(-1px)" } : undefined}
                />
                <span className={cn("text-[10px] leading-none", isActive && "font-semibold")}>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
