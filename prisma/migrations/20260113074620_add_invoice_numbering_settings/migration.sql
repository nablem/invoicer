-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "quoteId" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringInterval" TEXT,
    "nextRecurringDate" DATETIME,
    "isRetainer" BOOLEAN NOT NULL DEFAULT false,
    "retainerPercentage" REAL,
    "isBalance" BOOLEAN NOT NULL DEFAULT false,
    "retainerInvoiceId" TEXT,
    "retainerDeductionAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_retainerInvoiceId_fkey" FOREIGN KEY ("retainerInvoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("clientId", "createdAt", "currency", "date", "dueDate", "id", "isRecurring", "nextRecurringDate", "notes", "number", "quoteId", "recurringInterval", "status", "total", "updatedAt") SELECT "clientId", "createdAt", "currency", "date", "dueDate", "id", "isRecurring", "nextRecurringDate", "notes", "number", "quoteId", "recurringInterval", "status", "total", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");
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
    "invoiceUseYear" BOOLEAN NOT NULL DEFAULT false,
    "invoiceUseMonth" BOOLEAN NOT NULL DEFAULT false,
    "invoiceSequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Organization" ("address", "city", "companyId", "country", "createdAt", "defaultVat", "email", "id", "language", "logoUrl", "name", "phone", "updatedAt", "vatNumber", "website", "zipCode") SELECT "address", "city", "companyId", "country", "createdAt", "defaultVat", "email", "id", "language", "logoUrl", "name", "phone", "updatedAt", "vatNumber", "website", "zipCode" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
