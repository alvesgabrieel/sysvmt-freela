-- AlterTable
ALTER TABLE "Hosting" ALTER COLUMN "observation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Saller" ALTER COLUMN "observation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "observation" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TourOperator" ALTER COLUMN "observation" DROP NOT NULL;
