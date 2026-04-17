-- AlterEnum
ALTER TYPE "ChecklistStatus" ADD VALUE 'IGNORED';

-- AlterTable
ALTER TABLE "JobChecklist" ADD COLUMN     "isMandatory" BOOLEAN NOT NULL DEFAULT true;
