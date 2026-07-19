"use client";

import { useState } from "react";
import {
  Bell, Download, Settings, HelpCircle, ChevronRight,
  BookOpen, Award, Moon, Globe, Shield, LogOut, Flame,
} from "lucide-react";

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-success" : "bg-[#334155]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
      <div className="bg-[#1E293B] border border-[#334155] text-foreground text-sm px-5 py-3 rounded-xl shadow-lg">
        {message}
      </div>
    </div>
  );
}

export default function ProfileScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [dividendReminder, setDividendReminder] = useState(true);
  const [theme, setTheme] = useState<"深色" | "浅色">("深色");
  const [currency, setCurrency] = useState("¥ 人民币");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleExport = () => {
    showToast("报告已生成，可在下载目录查看");
  };

  const handleCurrencyCycle = () => {
    const options = ["¥ 人民币", "$ 美元", "€ 欧元"];
    const idx = options.indexOf(currency);
    const next = options[(idx + 1) % options.length];
    setCurrency(next);
    showToast(`货币已切换为 ${next.split(" ")[1]}`);
  };

  const handleThemeToggle = () => {
    const next = theme === "深色" ? "浅色" : "深色";
    setTheme(next);
    showToast(`已切换为${next}模式`);
  };

  const handleLogout = () => {
    showToast("已退出登录");
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="rounded-2xl bg-[#1E293B] p-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-xl font-bold text-[#0F172A] mb-3">
          DZ
        </div>
        <p className="text-lg font-bold">寻息投资者</p>
        <p className="text-xs text-muted">@diviseek_user</p>
        <span className="mt-2 text-[10px] bg-gold/20 text-gold px-3 py-1 rounded-full font-medium">
          高级会员
        </span>
      </div>

      <div className="rounded-xl bg-[#1E293B] p-4">
        <p className="text-sm font-medium mb-3">阅读成就</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-[#0F172A] p-3 text-center active:scale-95 transition-transform">
            <BookOpen size={16} className="text-muted mx-auto mb-1" />
            <p className="text-lg font-bold text-gold">24</p>
            <p className="text-[10px] text-muted">已读篇数</p>
          </div>
          <div className="rounded-lg bg-[#0F172A] p-3 text-center active:scale-95 transition-transform">
            <Flame size={16} className="text-muted mx-auto mb-1" />
            <p className="text-lg font-bold text-gold">7</p>
            <p className="text-[10px] text-muted">连续天数</p>
          </div>
          <div className="rounded-lg bg-[#0F172A] p-3 text-center active:scale-95 transition-transform">
            <Award size={16} className="text-muted mx-auto mb-1" />
            <p className="text-lg font-bold text-gold">12</p>
            <p className="text-[10px] text-muted">收藏篇数</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2 px-1">通知与偏好</p>
        <div className="rounded-xl bg-[#1E293B] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#334155]">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted" />
              <span className="text-sm">推送通知</span>
            </div>
            <Toggle enabled={pushEnabled} onToggle={() => {
              setPushEnabled(!pushEnabled);
              showToast(pushEnabled ? "推送通知已关闭" : "推送通知已开启");
            }} />
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-muted" />
              <span className="text-sm">除息提醒</span>
            </div>
            <Toggle enabled={dividendReminder} onToggle={() => {
              setDividendReminder(!dividendReminder);
              showToast(dividendReminder ? "除息提醒已关闭" : "除息提醒已开启");
            }} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2 px-1">数据管理</p>
        <div className="rounded-xl bg-[#1E293B] overflow-hidden">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 border-b border-[#334155] active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-muted" />
              <span className="text-sm">导出报告</span>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </button>
          <button
            onClick={handleCurrencyCycle}
            className="w-full flex items-center justify-between p-4 border-b border-[#334155] active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-muted" />
              <span className="text-sm">货币设置</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">{currency}</span>
              <ChevronRight size={14} className="text-muted" />
            </div>
          </button>
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between p-4 active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-muted" />
              <span className="text-sm">主题外观</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted">{theme}</span>
              <ChevronRight size={14} className="text-muted" />
            </div>
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2 px-1">关于与帮助</p>
        <div className="rounded-xl bg-[#1E293B] overflow-hidden">
          <button
            onClick={() => showToast("帮助中心")}
            className="w-full flex items-center justify-between p-4 border-b border-[#334155] active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-muted" />
              <span className="text-sm">帮助中心</span>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </button>
          <button
            onClick={() => showToast("隐私政策")}
            className="w-full flex items-center justify-between p-4 border-b border-[#334155] active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-muted" />
              <span className="text-sm">隐私政策</span>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </button>
          <button
            onClick={() => showToast("寻息 DiviSeek v1.0.0 · 专注股息投资的移动工具")}
            className="w-full flex items-center justify-between p-4 border-b border-[#334155] active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-muted" />
              <span className="text-sm">关于我们</span>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 active:bg-[#334155] transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-danger" />
              <span className="text-sm text-danger">退出登录</span>
            </div>
            <ChevronRight size={14} className="text-muted" />
          </button>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted/50 py-4">寻息 DiviSeek v1.0.0</p>
    </div>
  );
}
