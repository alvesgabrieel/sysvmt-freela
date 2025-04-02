/*
  Warnings:

  - You are about to drop the column `agencyCommission` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `sallerCommission` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `grossTotal` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netTotal` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCashback` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDiscount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "agencyCommission",
DROP COLUMN "sallerCommission",
ADD COLUMN     "grossTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "netTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalCashback" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalDiscount" DOUBLE PRECISION NOT NULL;
