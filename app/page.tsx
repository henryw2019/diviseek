"use client"

import { useState, useEffect } from "react"
import { BottomNav, type TabKey } from "@/components/diviseek/bottom-nav"
import { DashboardScreen } from "@/components/diviseek/dashboard-screen"
import { HoldingsScreen } from "@/components/diviseek/holdings-screen"
import { CalendarScreen } from "@/components/diviseek/calendar-screen"
import { SchoolScreen } from "@/components/diviseek/school-screen"
import { ProfileScreen } from "@/components/diviseek/profile-screen"
import { AuthPrompt } from "@/components/diviseek/auth-prompt"
import { AddHoldingScreen } from "@/components/diviseek/add-holding-screen"
import { getMe, getSettings, removeToken } from "@/lib/api"
import { SettingsContext, defaultSettings, type AppSettings } from "@/lib/settings-context"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("home")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [addHoldingKey, setAddHoldingKey] = useState(0)
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data.user)
        return getSettings()
      })
      .then((data) => {
        setSettings(data.settings)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(settings.theme)
  }, [settings.theme])

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }))
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
    setSettings(defaultSettings)
    setTab("home")
  }

  const requireAuth = () => {
    if (!user) {
      setShowAuth(true)
      return false
    }
    return true
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">寻息</p>
          <p className="mt-1 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (showAddHolding) {
    return (
      <AddHoldingScreen
        key={addHoldingKey}
        onBack={() => setShowAddHolding(false)}
        onAdded={() => {
          setShowAddHolding(false)
          setAddHoldingKey((k) => k + 1)
          setTab("holdings")
        }}
      />
    )
  }

  return (
    <SettingsContext.Provider value={settings}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        <main className="flex-1 pb-24">
          {tab === "home" && <DashboardScreen user={user} onNavigate={setTab} />}
          {tab === "holdings" && (
            <HoldingsScreen
              user={user}
              requireAuth={requireAuth}
              onAddHolding={() => setShowAddHolding(true)}
            />
          )}
          {tab === "calendar" && <CalendarScreen user={user} />}
          {tab === "school" && <SchoolScreen />}
          {tab === "profile" && (
            <ProfileScreen
              user={user}
              onLogout={user ? handleLogout : undefined}
              onLoginRequired={() => setShowAuth(true)}
              onSettingsChange={updateSettings}
            />
          )}
        </main>
        <BottomNav active={tab} onChange={setTab} />
        <AuthPrompt open={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
      </div>
    </SettingsContext.Provider>
  )
}
