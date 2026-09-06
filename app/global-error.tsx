"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">寻息</p>
            <p className="mt-1 text-sm text-muted-foreground">DiviSeek</p>
          </div>
          <div className="mt-4 max-w-sm rounded-2xl border border-border-subtle bg-card p-6 text-center">
            <p className="text-lg font-semibold text-foreground">出错了</p>
            <p className="mt-2 text-sm text-muted-foreground">{error.message || "应用加载失败，请刷新页面"}</p>
            <button
              onClick={reset}
              className="mt-4 inline-flex items-center rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/25"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
