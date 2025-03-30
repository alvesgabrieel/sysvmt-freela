-- CreateTable
CREATE TABLE "SallerCommission" (
    "id" SERIAL NOT NULL,
    "sallerId" INTEGER NOT NULL,
    "tourOperatorId" INTEGER NOT NULL,
    "upfrontCommission" DOUBLE PRECISION NOT NULL,
    "installmentCommission" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SallerCommission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SallerCommission" ADD CONSTRAINT "SallerCommission_sallerId_fkey" FOREIGN KEY ("sallerId") REFERENCES "Saller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SallerCommission" ADD CONSTRAINT "SallerCommission_tourOperatorId_fkey" FOREIGN KEY ("tourOperatorId") REFERENCES "TourOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
