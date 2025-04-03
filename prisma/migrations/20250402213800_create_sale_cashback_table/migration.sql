/*
  Warnings:

  - You are about to drop the column `cashbackId` on the `Sale` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CashbackStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'PENDING');

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_cashbackId_fkey";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "cashbackId";

-- CreateTable
CREATE TABLE "SaleCashback" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "cashbackId" INTEGER NOT NULL,
    "status" "CashbackStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleCashback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleCashback_saleId_key" ON "SaleCashback"("saleId");

-- AddForeignKey
ALTER TABLE "SaleCashback" ADD CONSTRAINT "SaleCashback_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCashback" ADD CONSTRAINT "SaleCashback_cashbackId_fkey" FOREIGN KEY ("cashbackId") REFERENCES "Cashback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
