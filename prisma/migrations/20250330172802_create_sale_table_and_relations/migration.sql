/*
  Warnings:

  - You are about to drop the column `purchaseData` on the `Cashback` table. All the data in the column will be lost.
  - You are about to drop the column `installmentComission` on the `TourOperator` table. All the data in the column will be lost.
  - You are about to drop the column `upfrontComission` on the `TourOperator` table. All the data in the column will be lost.
  - Added the required column `purchaseDate` to the `Cashback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('PIX', 'DINHEIRO', 'DEBITO', 'CREDITO');

-- AlterTable
ALTER TABLE "Cashback" DROP COLUMN "purchaseData",
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TourOperator" DROP COLUMN "installmentComission",
DROP COLUMN "upfrontComission",
ADD COLUMN     "installmentCommission" DOUBLE PRECISION,
ADD COLUMN     "upfrontCommission" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "idInTourOperator" INTEGER NOT NULL,
    "sallerId" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethodType" NOT NULL,
    "tourOperatorId" INTEGER NOT NULL,
    "sallerCommission" DOUBLE PRECISION NOT NULL,
    "agencyCommission" DOUBLE PRECISION NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "ticketDiscount" DOUBLE PRECISION NOT NULL,
    "hostingDiscount" DOUBLE PRECISION NOT NULL,
    "cashbackId" INTEGER,
    "observation" TEXT NOT NULL,
    "canceledSale" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleCompanion" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "companionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleCompanion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleTicket" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL,
    "kids" INTEGER NOT NULL,
    "halfPriceTicket" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleHosting" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "hostingId" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleHosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "issuedInvoice" TEXT NOT NULL,
    "estimatedIssueDate" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "expectedReceiptDate" TIMESTAMP(3),
    "invoiceReceived" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_saleId_key" ON "Invoice"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sallerId_fkey" FOREIGN KEY ("sallerId") REFERENCES "Saller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_tourOperatorId_fkey" FOREIGN KEY ("tourOperatorId") REFERENCES "TourOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashbackId_fkey" FOREIGN KEY ("cashbackId") REFERENCES "Cashback"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCompanion" ADD CONSTRAINT "SaleCompanion_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCompanion" ADD CONSTRAINT "SaleCompanion_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTicket" ADD CONSTRAINT "SaleTicket_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleTicket" ADD CONSTRAINT "SaleTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleHosting" ADD CONSTRAINT "SaleHosting_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleHosting" ADD CONSTRAINT "SaleHosting_hostingId_fkey" FOREIGN KEY ("hostingId") REFERENCES "Hosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
