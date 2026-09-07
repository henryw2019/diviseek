/**
 * Stock sync core: fetch full A-share universe from Eastmoney and batch-upsert
 * into Postgres. Used by both scripts/fetch-stocks.ts (CLI / old server cron)
 * and app/api/admin/sync/route.ts (Vercel Cron).
 *
 * BATCHING IS MANDATORY: row-by-row upserts cost ~1.15s/row across a cross-border
 * link (70min+ for ~5900 rows); a single multi-row INSERT ... ON CONFLICT does
 * the same work in ~24s.
 */

import { Prisma, PrismaClient } from "@prisma/client"

const EM_QUOTE = "http://push2delay.eastmoney.com/api/qt/clist/get"
const EM_DIV = "https://datacenter-web.eastmoney.com/api/data/v1/get"
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
const FS_A = "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048"
const QUOTE_FIELDS = "f2,f3,f8,f9,f12,f13,f14,f20,f23,f100"
const DELAY_MS = Number(process.env.SYNC_DELAY_MS || 800)
const EMAIL_HINT = "b59ba311e046edf6f8fa"

export interface SyncResult {
  mode: string
  quotesCreated: number
  quotesUpdated: number
  divEvents: number
  divStocks: number
  skippedUS: number
}

function log(msg: string) {
  console.log(`[sync] ${new Date().toISOString().slice(11, 19)} ${msg}`)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function emJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function num(v: any): number | null {
  if (v === "-" || v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

async function allQuotes(): Promise<any[]> {
  const first = await emJson(
    `${EM_QUOTE}?pn=1&pz=100&po=1&np=1&fltt=2&invt=2&fid=f12&fs=${encodeURIComponent(FS_A)}&fields=${QUOTE_FIELDS}`,
  )
  const total: number = first?.data?.total ?? 0
  const pages = Math.ceil(total / 100)
  log(`quotes: total=${total} pages=${pages}`)
  const rows = [...(first?.data?.diff ?? [])]
  for (let pn = 2; pn <= pages; pn++) {
    await sleep(DELAY_MS)
    try {
      const d = await emJson(
        `${EM_QUOTE}?pn=${pn}&pz=100&po=1&np=1&fltt=2&invt=2&fid=f12&fs=${encodeURIComponent(FS_A)}&fields=${QUOTE_FIELDS}`,
      )
      rows.push(...(d?.data?.diff ?? []))
    } catch (e) {
      log(`warn: page ${pn} failed (${(e as Error).message})`)
    }
  }
  return rows
}

/** Generate a cuid-like id without depending on cuid internals. */
function cuid(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `c${Date.now().toString(36)}${rand}`
}

export async function syncQuotes(prisma: PrismaClient, opts: { dry?: boolean } = {}): Promise<SyncResult> {
  const dry = !!opts.dry
  const rows = await allQuotes()
  let skippedUS = 0

  const hrefs = rows.map((r) => ({ r, ticker: String(r.f12 ?? "").trim() })).filter((x) => x.ticker)
  const tickers = hrefs.map((x) => x.ticker)
  // One round trip: know which existing rows we must skip (US market is never touched).
  const existing = tickers.length
    ? await prisma.stock.findMany({
        where: { ticker: { in: tickers } },
        select: { ticker: true, market: true },
      })
    : []
  const marketOf = new Map(existing.map((e) => [e.ticker, e.market]))

  const inserts: { id: string; ticker: string; name: string; sector: string | null; price: number | null; pe: number | null; cap: number | null }[] = []
  for (const { r, ticker } of hrefs) {
    const market = "CN"
    if (marketOf.get(ticker) === "US") {
      skippedUS++
      continue
    }
    inserts.push({
      id: cuid(),
      ticker,
      name: String(r.f14 ?? "").trim(),
      sector: typeof r.f100 === "string" && r.f100 !== "-" ? r.f100 : null,
      price: num(r.f2),
      pe: num(r.f9),
      cap: num(r.f20),
    })
  }

  if (dry) {
    log(`quotes[dry]: wouldUpsert=${inserts.length} skippedUS=${skippedUS}`)
    return { mode: "quotes", quotesCreated: 0, quotesUpdated: 0, divEvents: 0, divStocks: 0, skippedUS }
  }

  const created = await batchUpsertStocks(prisma, inserts)
  const updated = inserts.length - created
  log(`quotes: created=${created} updated=${updated} skippedUS=${skippedUS} (${inserts.length} rows in one statement)`)
  return { mode: "quotes", quotesCreated: created, quotesUpdated: updated, divEvents: 0, divStocks: 0, skippedUS }
}

/** Multi-row INSERT ... ON CONFLICT (ticker) DO UPDATE. Returns created count. */
export async function batchUpsertStocks(
  prisma: PrismaClient,
  rows: { id: string; ticker: string; name: string; sector: string | null; price: number | null; pe: number | null; cap: number | null }[],
): Promise<number> {
  if (rows.length === 0) return 0
  const values = rows
    .map(
      (r) =>
        `('${r.id}','${r.ticker.replace(/'/g, "''")}','${(r.name ?? "").replace(/'/g, "''")}','CN','CNY',${r.price ?? "NULL"},${r.sector ? `'${r.sector.replace(/'/g, "''")}'` : "NULL"},${r.pe ?? "NULL"},${r.cap ?? "NULL"},NOW(),NOW())`,
    )
    .join(",")
  const sql = `INSERT INTO "Stock" (id,ticker,name,market,currency,price,sector,"peRatio","marketCap","createdAt","updatedAt")
    VALUES ${values}
    ON CONFLICT (ticker) DO UPDATE SET
      name = EXCLUDED.name,
      market = EXCLUDED.market,
      currency = EXCLUDED.currency,
      price = EXCLUDED.price,
      sector = EXCLUDED.sector,
      "peRatio" = EXCLUDED."peRatio",
      "marketCap" = EXCLUDED."marketCap",
      "updatedAt" = NOW()`
  await prisma.$executeRawUnsafe(sql)
  // Created count: rows that did not conflict. Postgres does not report it on
  // INSERT ... ON CONFLICT DO UPDATE (no RETURNING for the whole set); we derive
  // it by counting rows that existed before across the same ticker set.
  const before = await prisma.stock.count({
    where: { ticker: { in: rows.map((r) => r.ticker) } },
  })
  return Math.max(0, rows.length - before)
}

export async function syncDividends(prisma: PrismaClient, opts: { dry?: boolean } = {}): Promise<SyncResult> {
  const dry = !!opts.dry
  const since = new Date(Date.now() - 365 * 2 * 86400_000).toISOString().slice(0, 10)
  const since365 = new Date(Date.now() - 365 * 86400_000).toISOString().slice(0, 10)
  const pageSize = 5000
  const records: any[] = []
  let page = 1
  for (;;) {
    const base =
      `${EM_DIV}?reportName=RPT_SHAREBONUS_DET&columns=ALL&pageSize=${pageSize}` +
      `&sortColumns=EX_DIVIDEND_DATE&sortTypes=-1` +
      `&filter=${encodeURIComponent(`(EX_DIVIDEND_DATE>='${since}')`)}`
    const d = await emJson(`${base}&pageNumber=${page}`)
    const batch: any[] = d?.result?.data ?? []
    records.push(...batch)
    const totalPages: number = d?.result?.pages ?? 1
    if (page >= totalPages || batch.length === 0) break
    page++
    await sleep(DELAY_MS)
  }
  log(`dividend receipts: ${records.length} (pages=${page})`)

  const grouped = new Map<string, any[]>()
  for (const rec of records) {
    const code = String(rec.SECURITY_CODE ?? "").trim()
    if (!code) continue
    if (!grouped.has(code)) grouped.set(code, [])
    grouped.get(code)!.push(rec)
  }

  // One round trip: which of these tickers exist and are CN market.
  const codes = [...grouped.keys()]
  const existingStocks = codes.length
    ? await prisma.stock.findMany({
        where: { ticker: { in: codes } },
        select: { ticker: true, market: true, price: true },
      })
    : []
  const stockByTicker = new Map(existingStocks.map((s) => [s.ticker, s]))

  // One round trip: which (ticker, exDate) already exist, to avoid duplicates.
  const planned: { ticker: string; exDate: string; amount: number }[] = []
  for (const [code, recs] of grouped) {
    const stock = stockByTicker.get(code)
    if (!stock || stock.market === "US") continue
    const sorted = [...recs].sort((a, b) =>
      String(b.EX_DIVIDEND_DATE).localeCompare(String(a.EX_DIVIDEND_DATE)),
    )
    for (const r of sorted) {
      const ex = String(r.EX_DIVIDEND_DATE ?? "").slice(0, 10)
      const perTen = num(r.PRETAX_BONUS_RMB)
      const amount = perTen !== null && perTen > 0 ? perTen / 10 : null
      if (!ex || ex.length !== 10 || amount === null) continue
      planned.push({ ticker: code, exDate: ex, amount })
    }
  }

  const existingDivs = planned.length
    ? await prisma.dividendHistory.findMany({
        where: { ticker: { in: codes }, exDate: { in: [...new Set(planned.map((p) => p.exDate))] } },
        select: { ticker: true, exDate: true },
      })
    : []
  const existingDivSet = new Set(existingDivs.map((d) => `${d.ticker}|${d.exDate}`))

  const toInsert = planned.filter((p) => !existingDivSet.has(`${p.ticker}|${p.exDate}`))

  if (!dry && toInsert.length > 0) {
    const values = toInsert
      .map((p) => `('${cuid()}','${p.ticker}','${p.exDate}',${p.amount},'regular','CNY')`)
      .join(",")
    await prisma.$executeRawUnsafe(
      `INSERT INTO "DividendHistory" (id,ticker,"exDate",amount,type,currency) VALUES ${values}`,
    )
  }
  log(`dividends: newEvents=${toInsert.length} (dry=${dry})`)

  // Recompute trailing-1y yield for each stock that has dividends + price.
  const yields: { ticker: string; yieldPct: number; latestEx: string }[] = []
  for (const [code, recs] of grouped) {
    const stock = stockByTicker.get(code)
    if (!stock || stock.market === "US") continue
    const sorted = [...recs].sort((a, b) =>
      String(b.EX_DIVIDEND_DATE).localeCompare(String(a.EX_DIVIDEND_DATE)),
    )
    const last12 = sorted.filter((r) => String(r.EX_DIVIDEND_DATE ?? "").slice(0, 10) >= since365)
    const perShare = last12.reduce((s, r) => s + ((num(r.PRETAX_BONUS_RMB) ?? 0) / 10), 0)
    const latestEx = sorted[0] ? String(sorted[0].EX_DIVIDEND_DATE ?? "").slice(0, 10) : null
    if (perShare > 0 && stock.price) {
      yields.push({
        ticker: code,
        yieldPct: Math.round((perShare / stock.price) * 10000) / 100,
        latestEx: latestEx!,
      })
    }
  }

  if (!dry && yields.length > 0) {
    const values = yields
      .map((y) => `('${y.ticker}',${y.yieldPct},'${y.latestEx}')`)
      .join(",")
    await prisma.$executeRawUnsafe(
      `UPDATE "Stock" AS s SET "dividendYield" = v.y, "exDate" = v.ex, "updatedAt" = NOW()
       FROM (VALUES ${values}) AS v(t, y, ex) WHERE s.ticker = v.t`,
    )
  }
  log(`dividends: yieldUpdates=${yields.length}`)
  return {
    mode: "dividends",
    quotesCreated: 0,
    quotesUpdated: 0,
    divEvents: toInsert.length,
    divStocks: yields.length,
    skippedUS: 0,
  }
}