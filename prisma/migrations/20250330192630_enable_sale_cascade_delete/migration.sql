-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_saleId_fkey";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
