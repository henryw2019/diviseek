import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { syncQuotes, syncDividends, type SyncResult } from "@/lib/stock-sync"

export const maxDuration = 300
export const preferredRegion = "hkg1"
export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

function isMondayUTC(now: Date): boolean {
  return now.getUTCDay() === 1
}

async function auth(req: NextRequest): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.SYNC_SECRET
  if (!secret) return { ok: false, error: "SYNC_SECRET not configured" }
  if (req.headers.get("authorization") !== `Bearer ${secret}`)
    return { ok: false, error: "unauthorized" }
  return { ok: true }
}

async function run(mode: "quotes" | "dividends" | "all"): Promise<SyncResult> {
  if (mode === "dividends") return syncDividends(prisma)
  if (mode === "all") {
    const quotes = await syncQuotes(prisma)
    const dividends = await syncDividends(prisma)
    return {
      mode: "all",
      quotesCreated: quotes.quotesCreated,
      quotesUpdated: quotes.quotesUpdated,
      divEvents: dividends.divEvents,
      divStocks: dividends.divStocks,
      skippedUS: quotes.skippedUS,
    }
  }
  return syncQuotes(prisma)
}

export async function GET(req: NextRequest) {
  const a = await auth(req)
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.error === "unauthorized" ? 401 : 500 })
  const modeParam = (req.nextUrl.searchParams.get("mode") ?? "").toLowerCase()
  let mode: "quotes" | "dividends" | "all" = "quotes"
  if (modeParam === "quotes" || modeParam === "dividends" || modeParam === "all") {
    mode = modeParam
  } else if (isMondayUTC(new Date())) {
    mode = "all"
  }
  try {
    const result = await run(mode)
    return NextResponse.json({ ok: true, ...result }, { status: 200 })
  } catch (e) {
    console.error("sync failed:", e)
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const a = await auth(req)
  if (!a.ok) return NextResponse.json({ error: a.error }, { status: a.error === "unauthorized" ? 401 : 500 })
  const body = (await req.json().catch(() => null)) as { mode?: string } | null
  const mode = body?.mode === "dividends" || body?.mode === "all" ? body.mode : "quotes"
  try {
    const result = await run(mode)
    return NextResponse.json({ ok: true, ...result }, { status: 200 })
  } catch (e) {
    console.error("sync failed:", e)
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}