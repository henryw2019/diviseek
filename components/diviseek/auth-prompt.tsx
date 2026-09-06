"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { register, login, setToken, resetPassword } from "@/lib/api"

type AuthPromptProps = {
  open: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export function AuthPrompt({ open, onClose, onSuccess }: AuthPromptProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      if (mode === "reset") {
        if (newPassword !== confirmPassword) {
          setError("两次密码输入不一致")
          setLoading(false)
          return
        }
        await resetPassword(phone, newPassword)
        setDone(true)
      } else {
        let result
        if (mode === "register") {
          result = await register(phone, password, nickname || undefined)
        } else {
          result = await login(phone, password)
        }
        setToken(result.token)
        onSuccess(result.user)
        onClose()
      }
    } catch (e: any) {
      setError(e.message || "操作失败")
    } finally {
      setLoading(false)
    }
  }

  const switchTo = (newMode: "login" | "register" | "reset") => {
    setMode(newMode)
    setError("")
    setDone(false)
    setNewPassword("")
    setConfirmPassword("")
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-t-3xl bg-card p-8 pb-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[color:var(--success)]/15">
            <Check className="size-8 text-[color:var(--success)]" />
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">密码已重置</p>
          <p className="mt-2 text-sm text-muted-foreground">请使用新密码登录</p>
          <button
            onClick={() => switchTo("login")}
            className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0f172a] hover:bg-amber-400"
          >
            去登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-card p-6 pb-10">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-foreground">
          <X className="size-5" />
        </button>

        <div className="mb-6 text-center">
          <p className="text-xl font-bold text-amber-500">寻息</p>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "reset" ? "重置密码" : "登录后数据将同步保存"}
          </p>
        </div>

        <h2 className="mb-4 text-center text-base font-semibold text-foreground">
          {mode === "login" ? "登录" : mode === "register" ? "注册" : "重置密码"}
        </h2>

        <div className="space-y-3">
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
          />

          {mode !== "reset" && (
            <input
              type="password"
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          )}

          {mode === "reset" && (
            <>
              <input
                type="password"
                placeholder="新密码（至少6位）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
              <input
                type="password"
                placeholder="确认新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
              />
            </>
          )}

          {mode === "register" && (
            <input
              type="text"
              placeholder="昵称（可选）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-border-subtle bg-surface-subtle px-4 py-3 text-sm text-foreground placeholder-slate-500 outline-none focus:border-amber-500/50"
            />
          )}

          {error && <p className="text-center text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0f172a] hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "请稍候..." : mode === "reset" ? "重置密码" : mode === "login" ? "登录" : "注册"}
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-slate-500">
          {mode === "login" ? (
            <>
              <p>
                还没有账号？
                <button onClick={() => switchTo("register")} className="ml-1 text-amber-500 hover:text-amber-400">
                  立即注册
                </button>
              </p>
              <button onClick={() => switchTo("reset")} className="text-xs text-slate-500 hover:text-amber-400">
                忘记密码？
              </button>
            </>
          ) : mode === "register" ? (
            <p>
              已有账号？
              <button onClick={() => switchTo("login")} className="ml-1 text-amber-500 hover:text-amber-400">
                去登录
              </button>
            </p>
          ) : (
            <button onClick={() => switchTo("login")} className="text-amber-500 hover:text-amber-400">
              返回登录
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
