-- AlterTable
ALTER TABLE "Order" ADD COLUMN "providerError" TEXT;
ALTER TABLE "Order" ADD COLUMN "providerOrderId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "providerRate" REAL;
ALTER TABLE "Service" ADD COLUMN "providerServiceId" TEXT;
