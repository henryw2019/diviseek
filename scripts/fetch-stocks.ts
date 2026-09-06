/**
 * Fetch full A-share universe from Eastmoney and upsert into DB.
 * usage: node scripts/fetch-stocks.ts [quotes|dividends] [--dry-run]
 * default runs both. US stocks are never modified.
 */

import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
config()

const prisma = new PrismaClient()

const EM_QUOTE = "http://push2delay.eastmoney.com/api/qt/clist/get"
const EM_DIV = "https://datacenter-web.eastmoney.com/api/data/v1/get"
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
const FS_A = "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048"
const QUOTE_FIELDS = "f2,f3,f8,f9,f12,f13,f14,f20,f23,f100"
const DELAY_MS = 800

const args = process.argv.slice(2)
const dry = args.includes("--dry-run")
const mode: "all" | "quotes" | "dividends" = args.includes("quotes")
  ? "quotes"
  : args.includes("dividends")
    ? "dividends"
    : "all"

function log(msg: string) {
  console.log(`[fetch] ${new Date().toISOString().slice(11, 19)} ${msg}`)
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

function marketOf(code: string, f13: any): string {
  return "CN"
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

async function syncQuotes() {
  const rows = await allQuotes()
  let created = 0
  let updated = 0
  for (const r of rows) {
    const ticker = String(r.f12 ?? "").trim()
    if (!ticker) continue
    const market = marketOf(ticker, r.f13)
    const existing = await prisma.stock.findUnique({ where: { ticker } })
    if (existing?.market === "US") continue
    const data = {
      name: String(r.f14 ?? "").trim(),
      market,
      currency: "CNY",
      sector: typeof r.f100 === "string" && r.f100 !== "-" ? r.f100 : null,
      price: num(r.f2),
      peRatio: num(r.f9),
      marketCap: num(r.f20),
    }
    if (dry) {
      created++
      continue
    }
    await prisma.stock.upsert({
      where: { ticker },
      create: { ticker, ...data },
      update: data,
    })
    if (existing) updated++
    else created++
  }
  log(`quotes: created=${created} updated=${updated}`)
}

async function syncDividends() {
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

  let events = 0
  let stocksUpdated = 0
  for (const [code, recs] of grouped) {
    const stock = await prisma.stock.findUnique({ where: { ticker: code } })
    if (!stock || stock.market === "US") continue
    if (dry) {
      events += recs.length
      continue
    }
    const sorted = [...recs].sort((a, b) =>
      String(b.EX_DIVIDEND_DATE).localeCompare(String(a.EX_DIVIDEND_DATE)),
    )
    for (const r of sorted) {
      const ex = String(r.EX_DIVIDEND_DATE ?? "").slice(0, 10)
      const perTen = num(r.PRETAX_BONUS_RMB)
      const amount = perTen !== null && perTen > 0 ? perTen / 10 : null
      if (!ex || ex.length !== 10 || amount === null) continue
      const hit = await prisma.dividendHistory.findFirst({ where: { ticker: code, exDate: ex } })
      if (hit) continue
      await prisma.dividendHistory.create({
        data: { ticker: code, exDate: ex, amount, type: "regular", currency: "CNY" },
      })
      events++
    }
    const last12 = sorted.filter((r) => String(r.EX_DIVIDEND_DATE ?? "").slice(0, 10) >= since365)
    const perShare = last12.reduce((s, r) => s + ((num(r.PRETAX_BONUS_RMB) ?? 0) / 10), 0)
    const latestEx = sorted[0] ? String(sorted[0].EX_DIVIDEND_DATE ?? "").slice(0, 10) : null
    if (perShare > 0 && stock.price) {
      await prisma.stock.update({
        where: { ticker: code },
        data: {
          dividendYield: Math.round((perShare / stock.price) * 10000) / 100,
          ...(latestEx ? { exDate: latestEx } : {}),
        },
      })
      stocksUpdated++
    }
  }
  log(`dividends: events=${events} stocksUpdated=${stocksUpdated}`)
}

async function main() {
  log(`mode=${mode} dry=${dry}`)
  if (mode !== "dividends") await syncQuotes()
  if (mode !== "quotes") await syncDividends()
  log("done")
}

main()
  .catch((e) => {
    console.error("[fetch] fatal:", e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())