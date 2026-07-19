-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "taxRate" REAL NOT NULL DEFAULT 20,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "calendarStart" TEXT NOT NULL DEFAULT 'sunday',
    "notifyExDate" BOOLEAN NOT NULL DEFAULT true,
    "notifyDividendPay" BOOLEAN NOT NULL DEFAULT true,
    "notifyArticle" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cover" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "readMinutes" INTEGER NOT NULL DEFAULT 5,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");
