/*
  Warnings:

  - The values [PENDING] on the enum `CashbackStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `hostingCommission` to the `TourOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCommission` to the `TourOperator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CashbackStatus_new" AS ENUM ('ACTIVE', 'EXPIRED');
ALTER TABLE "SaleCashback" ALTER COLUMN "status" TYPE "CashbackStatus_new" USING ("status"::text::"CashbackStatus_new");
ALTER TYPE "CashbackStatus" RENAME TO "CashbackStatus_old";
ALTER TYPE "CashbackStatus_new" RENAME TO "CashbackStatus";
DROP TYPE "CashbackStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "TourOperator" ADD COLUMN     "hostingCommission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ticketCommission" DOUBLE PRECISION NOT NULL;
