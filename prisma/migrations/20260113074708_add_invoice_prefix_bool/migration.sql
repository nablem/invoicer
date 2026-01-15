-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "companyId" TEXT,
    "vatNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "defaultVat" REAL NOT NULL DEFAULT 0,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "invoiceUsePrefix" BOOLEAN NOT NULL DEFAULT true,
    "invoiceUseYear" BOOLEAN NOT NULL DEFAULT false,
    "invoiceUseMonth" BOOLEAN NOT NULL DEFAULT false,
    "invoiceSequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Organization" ("address", "city", "companyId", "country", "createdAt", "defaultVat", "email", "id", "invoicePrefix", "invoiceSequence", "invoiceUseMonth", "invoiceUseYear", "language", "logoUrl", "name", "phone", "updatedAt", "vatNumber", "website", "zipCode") SELECT "address", "city", "companyId", "country", "createdAt", "defaultVat", "email", "id", "invoicePrefix", "invoiceSequence", "invoiceUseMonth", "invoiceUseYear", "language", "logoUrl", "name", "phone", "updatedAt", "vatNumber", "website", "zipCode" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
