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

  const res = await fetch(url, { ...options, headers })
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
