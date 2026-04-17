/*
  Warnings:

  - A unique constraint covering the columns `[jobNo]` on the table `MasterJob` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobNo` to the `MasterJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "jobChecklistId" TEXT;

-- AlterTable
ALTER TABLE "MasterJob" ADD COLUMN     "jobNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MasterJob_jobNo_key" ON "MasterJob"("jobNo");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_jobChecklistId_fkey" FOREIGN KEY ("jobChecklistId") REFERENCES "JobChecklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
