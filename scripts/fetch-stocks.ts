/**
 * CLI entry for the stock sync core (lib/stock-sync.ts).
 * usage: node scripts/fetch-stocks.ts [quotes|dividends] [--dry-run]
 * default runs both. US stocks are never modified.
 */

import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import { syncQuotes, syncDividends } from "../lib/stock-sync"
config()

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const dry = args.includes("--dry-run")
const mode: "all" | "quotes" | "dividends" = args.includes("quotes")
  ? "quotes"
  : args.includes("dividends")
    ? "dividends"
    : "all"

async function main() {
  console.log(`[fetch] mode=${mode} dry=${dry}`)
  if (mode !== "dividends") {
    const r = await syncQuotes(prisma, { dry })
    console.log(`[fetch] quotes done: +${r.quotesCreated} ~${r.quotesUpdated} skipUS=${r.skippedUS}`)
  }
  if (mode !== "quotes") {
    const r = await syncDividends(prisma, { dry })
    console.log(`[fetch] dividends done: +${r.divEvents} yield=${r.divStocks}`)
  }
  console.log("[fetch] done")
}

main()
  .catch((e) => {
    console.error("[fetch] fatal:", e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())