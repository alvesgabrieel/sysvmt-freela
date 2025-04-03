/*
  Warnings:

  - You are about to drop the column `hostingCommission` on the `TourOperator` table. All the data in the column will be lost.
  - You are about to drop the column `ticketCommission` on the `TourOperator` table. All the data in the column will be lost.
  - Added the required column `hostingCommissionInstallment` to the `TourOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostingCommissionUpfront` to the `TourOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCommissionInstallment` to the `TourOperator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCommissionUpfront` to the `TourOperator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TourOperator" DROP COLUMN "hostingCommission",
DROP COLUMN "ticketCommission",
ADD COLUMN     "hostingCommissionInstallment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hostingCommissionUpfront" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ticketCommissionInstallment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "ticketCommissionUpfront" DOUBLE PRECISION NOT NULL;
