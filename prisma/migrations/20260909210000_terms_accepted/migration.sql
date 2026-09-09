-- AlterTable: record acceptance of Terms/Privacy/Refund Policy at registration
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" DATETIME;
