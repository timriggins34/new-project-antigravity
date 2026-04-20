/*
  Warnings:

  - You are about to drop the `HSRule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[masterDocumentId,direction,mode,incoterm,hsCode,isMandatory]` on the table `DocumentRule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "HSRule" DROP CONSTRAINT "HSRule_masterDocumentId_fkey";

-- AlterTable
ALTER TABLE "DocumentRule" ADD COLUMN     "hsCode" TEXT,
ALTER COLUMN "direction" DROP NOT NULL,
ALTER COLUMN "mode" DROP NOT NULL;

-- DropTable
DROP TABLE "HSRule";

-- CreateIndex
CREATE UNIQUE INDEX "DocumentRule_masterDocumentId_direction_mode_incoterm_hsCod_key" ON "DocumentRule"("masterDocumentId", "direction", "mode", "incoterm", "hsCode", "isMandatory");
