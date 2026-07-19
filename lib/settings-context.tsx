"use client"

import { createContext, useContext } from "react"

export interface AppSettings {
  currency: string
  taxRate: number
  theme: string
  calendarStart: string
  notifyExDate: boolean
  notifyDividendPay: boolean
  notifyArticle: boolean
}

export const defaultSettings: AppSettings = {
  currency: "CNY",
  taxRate: 20,
  theme: "dark",
  calendarStart: "sunday",
  notifyExDate: true,
  notifyDividendPay: true,
  notifyArticle: false,
}

export const SettingsContext = createContext<AppSettings>(defaultSettings)

export function useSettings() {
  return useContext(SettingsContext)
}

const symbols: Record<string, string> = { CNY: "¥", USD: "$", HKD: "HK$" }

export function formatCurrency(n: number, currency?: string) {
  const cur = currency || "CNY"
  const sym = symbols[cur] || "¥"
  if (cur === "USD") {
    return sym + Math.round(n / 7.2).toLocaleString("en-US")
  }
  if (cur === "HKD") {
    return sym + Math.round(n * 1.08).toLocaleString("en-US")
  }
  return sym + n.toLocaleString("zh-CN")
}

export function calcAfterTax(n: number, taxRate: number) {
  return Math.round(n * (1 - taxRate / 100))
}
