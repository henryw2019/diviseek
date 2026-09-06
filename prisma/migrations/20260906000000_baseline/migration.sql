-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL DEFAULT 'US',
    "sector" TEXT,
    "industry" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "price" DOUBLE PRECISION,
    "dividendYield" DOUBLE PRECISION,
    "frequency" TEXT,
    "dividendPerShare" DOUBLE PRECISION,
    "exDate" TEXT,
    "payDate" TEXT,
    "divGrowth1y" DOUBLE PRECISION,
    "divGrowth3y" DOUBLE PRECISION,
    "divGrowth5y" DOUBLE PRECISION,
    "divYears" INTEGER,
    "payoutRatio" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "peRatio" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "calendarStart" TEXT NOT NULL DEFAULT 'sunday',
    "notifyExDate" BOOLEAN NOT NULL DEFAULT true,
    "notifyDividendPay" BOOLEAN NOT NULL DEFAULT true,
    "notifyArticle" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DividendHistory" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "exDate" TEXT NOT NULL,
    "payDate" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'regular',
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "DividendHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shares" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextExDate" TEXT NOT NULL,
    "annualIncome" DOUBLE PRECISION NOT NULL,
    "drip" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "avgCost" DOUBLE PRECISION,
    "purchaseDate" TEXT,
    "market" TEXT NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cover" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ticker_key" ON "Stock"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "DividendHistory_ticker_idx" ON "DividendHistory"("ticker");

-- CreateIndex
CREATE INDEX "DividendHistory_exDate_idx" ON "DividendHistory"("exDate");

-- CreateIndex
CREATE INDEX "PriceHistory_ticker_idx" ON "PriceHistory"("ticker");

-- CreateIndex
CREATE INDEX "PriceHistory_date_idx" ON "PriceHistory"("date");

-- CreateIndex
CREATE UNIQUE INDEX "PriceHistory_ticker_date_key" ON "PriceHistory"("ticker", "date");

-- CreateIndex
CREATE INDEX "Holding_userId_idx" ON "Holding"("userId");

-- CreateIndex
CREATE INDEX "UserReading_userId_idx" ON "UserReading"("userId");

-- CreateIndex
CREATE INDEX "UserReading_articleId_idx" ON "UserReading"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReading_userId_articleId_key" ON "UserReading"("userId", "articleId");

-- CreateIndex
CREATE INDEX "UserBookmark_userId_idx" ON "UserBookmark"("userId");

-- CreateIndex
CREATE INDEX "UserBookmark_articleId_idx" ON "UserBookmark"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBookmark_userId_articleId_key" ON "UserBookmark"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DividendHistory" ADD CONSTRAINT "DividendHistory_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Stock"("ticker") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_ticker_fkey" FOREIGN KEY ("ticker") REFERENCES "Stock"("ticker") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReading" ADD CONSTRAINT "UserReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReading" ADD CONSTRAINT "UserReading_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBookmark" ADD CONSTRAINT "UserBookmark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

