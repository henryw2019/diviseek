"use client"

import { useState } from "react"
import { register, login, setToken } from "@/lib/api"

type AuthScreenProps = {
  onLogin: (user: any) => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      let result
      if (mode === "register") {
        result = await register(phone, password, nickname || undefined)
      } else {
        result = await login(phone, password)
      }
      setToken(result.token)
      onLogin(result.user)
    } catch (e: any) {
      setError(e.message || "操作失败")
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError("")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-3xl font-bold text-amber-500">寻息</p>
          <p className="mt-1 text-sm text-slate-400">DiviSeek</p>
        </div>

        <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
          {mode === "login" ? "登录" : "注册"}
        </h1>

        <div className="space-y-4">
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-foreground placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-surface-hover"
          />

          <input
            type="password"
            placeholder="请输入密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-foreground placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-surface-hover"
          />

          {mode === "register" && (
            <input
              type="text"
              placeholder="昵称（可选）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-foreground placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:bg-surface-hover"
            />
          )}

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-base font-semibold text-[#0f172a] transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "请稍候..." : mode === "login" ? "登录" : "注册"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login" ? "还没有账号？" : "已有账号？"}
          <button onClick={toggleMode} className="ml-1 text-amber-500 hover:text-amber-400">
            {mode === "login" ? "立即注册" : "去登录"}
          </button>
        </p>
      </div>
    </div>
  )
}
