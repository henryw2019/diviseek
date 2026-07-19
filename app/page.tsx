"use client"

import { useState } from "react"
import { BottomNav, type TabKey } from "@/components/diviseek/bottom-nav"
import { DashboardScreen } from "@/components/diviseek/dashboard-screen"
import { HoldingsScreen } from "@/components/diviseek/holdings-screen"
import { CalendarScreen } from "@/components/diviseek/calendar-screen"
import { SchoolScreen } from "@/components/diviseek/school-screen"
import { ProfileScreen } from "@/components/diviseek/profile-screen"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("home")

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">
        {tab === "home" && <DashboardScreen onNavigate={setTab} />}
        {tab === "holdings" && <HoldingsScreen />}
        {tab === "calendar" && <CalendarScreen />}
        {tab === "school" && <SchoolScreen />}
        {tab === "profile" && <ProfileScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
