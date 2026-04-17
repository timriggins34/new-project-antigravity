-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "MasterDocumentType" AS ENUM ('SHIPMENT', 'ONE_TIME', 'RECURRING', 'CONTAINER');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('MISSING', 'VERIFY', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "clientType" TEXT NOT NULL,
    "constitution" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "clientSinceYear" TEXT,
    "pan" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "iec" TEXT NOT NULL,
    "cin_llpin" TEXT NOT NULL,
    "tan" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactNickname" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact1" TEXT NOT NULL,
    "contact2" TEXT,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "swift" TEXT NOT NULL,
    "bankAddress" TEXT NOT NULL,
    "adCode" TEXT NOT NULL,
    "details" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClearanceJob" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "alert" BOOLEAN NOT NULL,
    "date" TEXT NOT NULL,
    "masterJobId" TEXT,
    "assignedToId" TEXT,
    "icegateChallan" TEXT,
    "dutyAmount" DOUBLE PRECISION,
    "penalty" DOUBLE PRECISION,
    "paymentDate" TIMESTAMP(3),
    "oocTimestamp" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClearanceJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSCodeItem" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "assessableValue" DOUBLE PRECISION,
    "clearanceJobId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HSCodeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocJob" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hasHardCopyBOL" BOOLEAN NOT NULL DEFAULT false,
    "hasHardCopyDO" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsTrip" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "job" TEXT NOT NULL,
    "truck" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eta" TEXT NOT NULL,
    "delayed" BOOLEAN NOT NULL DEFAULT false,
    "assignedToId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licence" (
    "id" TEXT NOT NULL,
    "licence_id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expiry" TEXT NOT NULL,
    "utilized" INTEGER,
    "alert" BOOLEAN NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightJob" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "mbl" TEXT,
    "awb" TEXT,
    "type" TEXT NOT NULL,
    "pol" TEXT NOT NULL,
    "pod" TEXT NOT NULL,
    "vessel" TEXT NOT NULL,
    "etd" TEXT NOT NULL,
    "eta" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "alert" BOOLEAN NOT NULL,
    "masterJobId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreightJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT,
    "docJobId" TEXT,
    "vendorId" TEXT,
    "clearanceJobId" TEXT,
    "logisticsTripId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterJob" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "incoterm" TEXT NOT NULL,
    "hsCode" TEXT,
    "computedStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "type" "MasterDocumentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRule" (
    "id" TEXT NOT NULL,
    "masterDocumentId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "incoterm" TEXT,
    "stageRequired" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSRule" (
    "id" TEXT NOT NULL,
    "masterDocumentId" TEXT NOT NULL,
    "hsCode" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HSRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobChecklist" (
    "id" TEXT NOT NULL,
    "masterJobId" TEXT NOT NULL,
    "masterDocumentId" TEXT NOT NULL,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'MISSING',
    "filePath" TEXT,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClearanceJobToVendor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FreightJobToVendor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_id_key" ON "Client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendor_id_key" ON "Vendor"("vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceJob_job_id_key" ON "ClearanceJob"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "DocJob_job_id_key" ON "DocJob"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsTrip_trip_id_key" ON "LogisticsTrip"("trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "Licence_licence_id_key" ON "Licence"("licence_id");

-- CreateIndex
CREATE UNIQUE INDEX "FreightJob_job_id_key" ON "FreightJob"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "MasterDocument_name_key" ON "MasterDocument"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ClearanceJobToVendor_AB_unique" ON "_ClearanceJobToVendor"("A", "B");

-- CreateIndex
CREATE INDEX "_ClearanceJobToVendor_B_index" ON "_ClearanceJobToVendor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FreightJobToVendor_AB_unique" ON "_FreightJobToVendor"("A", "B");

-- CreateIndex
CREATE INDEX "_FreightJobToVendor_B_index" ON "_FreightJobToVendor"("B");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceJob" ADD CONSTRAINT "ClearanceJob_masterJobId_fkey" FOREIGN KEY ("masterJobId") REFERENCES "MasterJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceJob" ADD CONSTRAINT "ClearanceJob_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceJob" ADD CONSTRAINT "ClearanceJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceJob" ADD CONSTRAINT "ClearanceJob_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HSCodeItem" ADD CONSTRAINT "HSCodeItem_clearanceJobId_fkey" FOREIGN KEY ("clearanceJobId") REFERENCES "ClearanceJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HSCodeItem" ADD CONSTRAINT "HSCodeItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HSCodeItem" ADD CONSTRAINT "HSCodeItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocJob" ADD CONSTRAINT "DocJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocJob" ADD CONSTRAINT "DocJob_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsTrip" ADD CONSTRAINT "LogisticsTrip_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsTrip" ADD CONSTRAINT "LogisticsTrip_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsTrip" ADD CONSTRAINT "LogisticsTrip_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightJob" ADD CONSTRAINT "FreightJob_masterJobId_fkey" FOREIGN KEY ("masterJobId") REFERENCES "MasterJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightJob" ADD CONSTRAINT "FreightJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightJob" ADD CONSTRAINT "FreightJob_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_docJobId_fkey" FOREIGN KEY ("docJobId") REFERENCES "DocJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clearanceJobId_fkey" FOREIGN KEY ("clearanceJobId") REFERENCES "ClearanceJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_logisticsTripId_fkey" FOREIGN KEY ("logisticsTripId") REFERENCES "LogisticsTrip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterJob" ADD CONSTRAINT "MasterJob_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRule" ADD CONSTRAINT "DocumentRule_masterDocumentId_fkey" FOREIGN KEY ("masterDocumentId") REFERENCES "MasterDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HSRule" ADD CONSTRAINT "HSRule_masterDocumentId_fkey" FOREIGN KEY ("masterDocumentId") REFERENCES "MasterDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobChecklist" ADD CONSTRAINT "JobChecklist_masterJobId_fkey" FOREIGN KEY ("masterJobId") REFERENCES "MasterJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobChecklist" ADD CONSTRAINT "JobChecklist_masterDocumentId_fkey" FOREIGN KEY ("masterDocumentId") REFERENCES "MasterDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClearanceJobToVendor" ADD CONSTRAINT "_ClearanceJobToVendor_A_fkey" FOREIGN KEY ("A") REFERENCES "ClearanceJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClearanceJobToVendor" ADD CONSTRAINT "_ClearanceJobToVendor_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreightJobToVendor" ADD CONSTRAINT "_FreightJobToVendor_A_fkey" FOREIGN KEY ("A") REFERENCES "FreightJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreightJobToVendor" ADD CONSTRAINT "_FreightJobToVendor_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
