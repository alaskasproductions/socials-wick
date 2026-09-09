-- AlterTable: storefront checkout details on FundRequest
ALTER TABLE "FundRequest" ADD COLUMN "checkoutServiceId" TEXT;
ALTER TABLE "FundRequest" ADD COLUMN "checkoutQuantity" INTEGER;
ALTER TABLE "FundRequest" ADD COLUMN "checkoutLink" TEXT;
ALTER TABLE "FundRequest" ADD COLUMN "checkoutOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FundRequest_checkoutOrderId_key" ON "FundRequest"("checkoutOrderId");
