-- DropForeignKey
ALTER TABLE "SallerCommission" DROP CONSTRAINT "SallerCommission_sallerId_fkey";

-- AddForeignKey
ALTER TABLE "SallerCommission" ADD CONSTRAINT "SallerCommission_sallerId_fkey" FOREIGN KEY ("sallerId") REFERENCES "Saller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
