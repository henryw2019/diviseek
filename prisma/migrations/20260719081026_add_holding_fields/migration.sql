-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Holding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "yield" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "nextExDate" TEXT NOT NULL,
    "annualIncome" REAL NOT NULL,
    "drip" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL,
    "avgCost" REAL,
    "purchaseDate" TEXT,
    "market" TEXT NOT NULL DEFAULT 'US',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Holding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Holding" ("annualIncome", "color", "createdAt", "drip", "frequency", "id", "name", "nextExDate", "shares", "ticker", "updatedAt", "userId", "yield") SELECT "annualIncome", "color", "createdAt", "drip", "frequency", "id", "name", "nextExDate", "shares", "ticker", "updatedAt", "userId", "yield" FROM "Holding";
DROP TABLE "Holding";
ALTER TABLE "new_Holding" RENAME TO "Holding";
CREATE INDEX "Holding_userId_idx" ON "Holding"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
