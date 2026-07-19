"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { register, login, setToken } from "@/lib/api"

type AuthPromptProps = {
  open: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export function AuthPrompt({ open, onClose, onSuccess }: AuthPromptProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

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
      onSuccess(result.user)
      onClose()
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-[#0f172a] p-6 pb-10">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="size-5" />
        </button>

        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-amber-500">寻息</p>
          <p className="mt-1 text-sm text-slate-400">登录后数据将同步保存</p>
        </div>

        <h2 className="mb-4 text-center text-base font-semibold text-white">
          {mode === "login" ? "登录" : "注册"}
        </h2>

        <div className="space-y-3">
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
          />
          <input
            type="password"
            placeholder="请输入密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
          />
          {mode === "register" && (
            <input
              type="text"
              placeholder="昵称（可选）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          )}

          {error && <p className="text-center text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0f172a] hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "请稍候..." : mode === "login" ? "登录" : "注册"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === "login" ? "还没有账号？" : "已有账号？"}
          <button onClick={toggleMode} className="ml-1 text-amber-500 hover:text-amber-400">
            {mode === "login" ? "立即注册" : "去登录"}
          </button>
        </p>
      </div>
    </div>
  )
}
