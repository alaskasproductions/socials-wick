-- CreateTable
CREATE TABLE "CustomerNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "href" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CustomerNotification_userId_readAt_idx" ON "CustomerNotification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "CustomerNotification_userId_createdAt_idx" ON "CustomerNotification"("userId", "createdAt");
