/*
  Warnings:

  - You are about to drop the column `city` on the `TourOperator` table. All the data in the column will be lost.
  - You are about to drop the column `observation` on the `TourOperator` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `TourOperator` table. All the data in the column will be lost.
  - Added the required column `contact` to the `TourOperator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TourOperator" DROP COLUMN "city",
DROP COLUMN "observation",
DROP COLUMN "state",
ADD COLUMN     "contact" TEXT NOT NULL;
