"use client";

import { ChevronLeft, Compass, GitCommitHorizontal } from "lucide-react";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0";
const APP_BUILD_TIME = process.env.NEXT_PUBLIC_APP_BUILD_TIME || "";
const APP_COMMIT_MESSAGE = process.env.NEXT_PUBLIC_APP_COMMIT_MESSAGE || "";
const APP_COMMIT_URL = process.env.NEXT_PUBLIC_APP_COMMIT_URL || "";

export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen px-5 pt-8 pb-6">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="返回"
          className="flex size-9 items-center justify-center rounded-full bg-surface-subtle transition-colors hover:bg-surface-subtle/70"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">关于</h1>
      </header>

      <section className="mt-8 flex flex-col items-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30">
          <Compass className="size-10 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-bold">DiviSeek 寻息</h2>
        <p className="mt-1 text-sm text-muted-foreground">股票股息追踪应用</p>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border-subtle bg-card">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3.5 last:border-b-0">
          <span className="text-sm">版本号</span>
          <span className="text-sm tabular-nums text-muted-foreground">{APP_VERSION}</span>
        </div>
        {APP_BUILD_TIME && (
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3.5 last:border-b-0">
            <span className="text-sm">构建时间</span>
            <span className="text-sm tabular-nums text-muted-foreground">{APP_BUILD_TIME}</span>
          </div>
        )}
        {APP_COMMIT_MESSAGE && (
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3.5 last:border-b-0">
            <span className="flex items-center gap-1.5 text-sm">
              <GitCommitHorizontal className="size-4 text-muted-foreground" />
              提交说明
            </span>
            <span className="max-w-[60%] truncate text-sm text-muted-foreground">
              {APP_COMMIT_MESSAGE}
            </span>
          </div>
        )}
        {APP_COMMIT_URL && (
          <a
            href={APP_COMMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between px-4 py-3.5 text-left last:border-b-0 transition-colors hover:bg-surface-subtle/50"
          >
            <span className="text-sm">查看完整提交</span>
            <span className="text-sm text-primary">GitHub ↗</span>
          </a>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        数据来源：东方财富 · 仅供学习参考，不构成投资建议
      </p>
    </div>
  );
}