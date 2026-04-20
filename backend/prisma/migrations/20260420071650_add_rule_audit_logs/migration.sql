-- CreateTable
CREATE TABLE "RuleAuditLog" (
    "id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "incoterm" TEXT,
    "hsCode" TEXT,
    "addedMandatory" INTEGER NOT NULL,
    "removedMandatory" INTEGER NOT NULL,
    "addedOptional" INTEGER NOT NULL,
    "removedOptional" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RuleAuditLog" ADD CONSTRAINT "RuleAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
