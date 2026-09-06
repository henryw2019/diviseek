const TOKEN_KEY = "diviseek-token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  const res = await fetch(url, { ...options, headers, signal: controller.signal })
  clearTimeout(timeoutId)
  const data = await res.json()

  if (!data.success) {
    throw new Error(data.error || "请求失败")
  }

  return data.data
}

export async function register(phone: string, password: string, nickname?: string) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, password, nickname }),
  })
}

export async function login(phone: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  })
}

export async function getMe() {
  return apiFetch("/api/auth/me")
}

export async function getHoldings() {
  return apiFetch("/api/holdings")
}

export async function createHolding(data: {
  ticker: string
  name: string
  shares: number
  yield: number
  frequency: string
  nextExDate: string
  annualIncome: number
  drip?: boolean
  color?: string
  avgCost?: number | null
  purchaseDate?: string | null
  market?: string
}) {
  return apiFetch("/api/holdings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateHolding(id: string, data: Record<string, any>) {
  return apiFetch(`/api/holdings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteHolding(id: string) {
  return apiFetch(`/api/holdings/${id}`, {
    method: "DELETE",
  })
}

export async function getCalendarEvents() {
  return apiFetch("/api/calendar")
}

export async function getSettings() {
  return apiFetch("/api/settings")
}

export async function updateSettings(data: Record<string, any>) {
  return apiFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function getArticles(category?: string, search?: string) {
  const params = new URLSearchParams()
  if (category && category !== "全部") params.set("category", category)
  if (search) params.set("search", search)
  const qs = params.toString()
  return apiFetch(`/api/articles${qs ? `?${qs}` : ""}`)
}

export async function getReadingStats() {
  return apiFetch("/api/reading")
}

export async function saveReadingProgress(articleId: string, progress: number, completed: boolean) {
  return apiFetch("/api/reading", {
    method: "POST",
    body: JSON.stringify({ articleId, progress, completed }),
  })
}

export async function getBookmarks() {
  return apiFetch("/api/bookmarks")
}

export async function toggleBookmark(articleId: string) {
  return apiFetch("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ articleId }),
  })
}

export async function getAchievements() {
  return apiFetch("/api/achievements")
}

export async function resetPassword(phone: string, newPassword: string) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ phone, newPassword }),
  })
}

export async function searchStocksApi(q: string, market?: string) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (market) params.set("market", market)
  return apiFetch(`/api/stocks?${params}`)
}

export async function getStockDetail(ticker: string) {
  return apiFetch(`/api/stocks/${ticker.toUpperCase()}`)
}

export async function getStockPrices(ticker: string) {
  return apiFetch(`/api/stocks/${ticker.toUpperCase()}/prices`)
}
