/*
  Warnings:

  - You are about to drop the column `checkin` on the `Cashback` table. All the data in the column will be lost.
  - You are about to drop the column `checkout` on the `Cashback` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Cashback` table. All the data in the column will be lost.
  - Added the required column `selectType` to the `Cashback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CashbackType" AS ENUM ('CHECKIN', 'CHECKOUT', 'PURCHASEDATE');

-- AlterTable
ALTER TABLE "Cashback" DROP COLUMN "checkin",
DROP COLUMN "checkout",
DROP COLUMN "purchaseDate",
ADD COLUMN     "selectType" "CashbackType" NOT NULL;
