/*
  Warnings:

  - Added the required column `checkin` to the `Cashback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkout` to the `Cashback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseData` to the `Cashback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cashback" ADD COLUMN     "checkin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "checkout" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "purchaseData" TIMESTAMP(3) NOT NULL;
