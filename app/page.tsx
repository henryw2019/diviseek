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
import { AchievementsScreen } from "@/components/diviseek/achievements-screen"
import { AboutScreen } from "@/components/diviseek/about-screen"
import { getMe, getSettings, removeToken } from "@/lib/api"
import { SettingsContext, defaultSettings, type AppSettings } from "@/lib/settings-context"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("home")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [addHoldingKey, setAddHoldingKey] = useState(0)
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") return defaultSettings
    const theme = document.documentElement.classList.contains("light") ? "light" : "dark"
    return { ...defaultSettings, theme }
  })

  // Restore tab from URL when navigating back from article
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab") as TabKey | null
    if (tabParam && ["home", "holdings", "calendar", "school", "profile"].includes(tabParam)) {
      setTab(tabParam)
    }
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

  // Sync tab to URL so article back-button reads it correctly
  useEffect(() => {
    const url = new URL(window.location.href)
    const current = url.searchParams.get("tab")
    if (current !== tab) {
      url.searchParams.set("tab", tab)
      window.history.replaceState(null, "", url.toString())
    }
  }, [tab])

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

  if (showAchievements) {
    return (
      <SettingsContext.Provider value={settings}>
        <div className="mx-auto w-full max-w-md md:max-w-2xl bg-background">
          <AchievementsScreen
            user={user}
            onLoginRequired={() => setShowAuth(true)}
            onBack={() => setShowAchievements(false)}
          />
          <AuthPrompt open={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
        </div>
      </SettingsContext.Provider>
    )
  }

  if (showAbout) {
    return (
      <SettingsContext.Provider value={settings}>
        <div className="mx-auto w-full max-w-md md:max-w-2xl bg-background">
          <AboutScreen onBack={() => setShowAbout(false)} />
          <AuthPrompt open={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
        </div>
      </SettingsContext.Provider>
    )
  }

  return (
    <SettingsContext.Provider value={settings}>
      <div className="mx-auto flex min-h-screen w-full max-w-md md:max-w-2xl flex-col bg-background">
        <main className="flex-1 pb-24">
          <div className={tab === "home" ? "block" : "hidden"}><DashboardScreen user={user} onNavigate={setTab} /></div>
          <div className={tab === "holdings" ? "block" : "hidden"}>
            <HoldingsScreen
              user={user}
              requireAuth={requireAuth}
              onAddHolding={() => setShowAddHolding(true)}
            />
          </div>
          <div className={tab === "calendar" ? "block" : "hidden"}><CalendarScreen user={user} /></div>
          <div className={tab === "school" ? "block" : "hidden"}><SchoolScreen user={user} onLoginRequired={() => setShowAuth(true)} /></div>
          <div className={tab === "profile" ? "block" : "hidden"}>
            <ProfileScreen
              user={user}
              onLogout={user ? handleLogout : undefined}
              onLoginRequired={() => setShowAuth(true)}
              onSettingsChange={updateSettings}
              onAchievements={() => setShowAchievements(true)}
              onAbout={() => setShowAbout(true)}
            />
          </div>
        </main>
        <BottomNav active={tab} onChange={setTab} />
        <AuthPrompt open={showAuth} onClose={() => setShowAuth(false)} onSuccess={setUser} />
      </div>
    </SettingsContext.Provider>
  )
}
