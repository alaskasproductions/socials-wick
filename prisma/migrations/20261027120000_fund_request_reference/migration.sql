-- AlterTable
ALTER TABLE "FundRequest" ADD COLUMN "reference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FundRequest_reference_key" ON "FundRequest"("reference");
