/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContributionMode" AS ENUM ('PACK_20K', 'PACK_50K', 'PACK_100K');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'OPTED_OUT', 'SUSPENDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OptOutStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributionCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "numberPickingStartDate" TIMESTAMP(3),
    "status" "CycleStatus" NOT NULL DEFAULT 'UPCOMING',
    "paymentDeadlineDay" INTEGER NOT NULL DEFAULT 29,
    "totalSlots" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "contributionMode" "ContributionMode" NOT NULL,
    "pickedNumber" INTEGER,
    "monthlyAmount" INTEGER NOT NULL,
    "totalPayout" INTEGER NOT NULL,
    "fineAmount" INTEGER NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasOptedOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "monthNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paidAmount" INTEGER,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "hasFine" BOOLEAN NOT NULL DEFAULT false,
    "fineAmount" INTEGER NOT NULL DEFAULT 0,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,
    "proofOfPayment" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "scheduledMonth" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transferReference" TEXT,
    "processedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptOutRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "OptOutStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "totalPaid" INTEGER NOT NULL,
    "penaltyAmount" INTEGER NOT NULL DEFAULT 0,
    "refundAmount" INTEGER NOT NULL DEFAULT 0,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,

    CONSTRAINT "OptOutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "pack20kMonthly" INTEGER NOT NULL DEFAULT 20000,
    "pack20kPayout" INTEGER NOT NULL DEFAULT 200000,
    "pack20kFine" INTEGER NOT NULL DEFAULT 2000,
    "pack50kMonthly" INTEGER NOT NULL DEFAULT 50000,
    "pack50kPayout" INTEGER NOT NULL DEFAULT 500000,
    "pack50kFine" INTEGER NOT NULL DEFAULT 2500,
    "pack100kMonthly" INTEGER NOT NULL DEFAULT 100000,
    "pack100kPayout" INTEGER NOT NULL DEFAULT 1000000,
    "pack100kFine" INTEGER NOT NULL DEFAULT 5000,
    "optOutPenaltyPercent" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NumberSettings" (
    "id" TEXT NOT NULL,
    "totalNumbers" INTEGER NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NumberSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_participationId_key" ON "BankDetails"("participationId");

-- CreateIndex
CREATE INDEX "Participation_cycleId_pickedNumber_idx" ON "Participation"("cycleId", "pickedNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_userId_cycleId_key" ON "Participation"("userId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_cycleId_pickedNumber_key" ON "Participation"("cycleId", "pickedNumber");

-- CreateIndex
CREATE INDEX "Payment_status_dueDate_idx" ON "Payment"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_participationId_monthNumber_key" ON "Payment"("participationId", "monthNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_participationId_key" ON "Payout"("participationId");

-- CreateIndex
CREATE INDEX "Payout_status_scheduledDate_idx" ON "Payout"("status", "scheduledDate");

-- CreateIndex
CREATE INDEX "OptOutRequest_status_requestedAt_idx" ON "OptOutRequest"("status", "requestedAt");

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ContributionCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptOutRequest" ADD CONSTRAINT "OptOutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
