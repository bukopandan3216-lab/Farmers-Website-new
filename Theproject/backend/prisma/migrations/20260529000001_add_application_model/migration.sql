-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "applications" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "hashedPassword" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "farmName" TEXT,
  "farmAddress" TEXT,
  "description" TEXT,
  "validIdUrl" TEXT,
  "businessPermitUrl" TEXT,
  "profileImageUrl" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_email_key" ON "applications"("email");
CREATE INDEX "applications_email_idx" ON "applications"("email");
CREATE INDEX "applications_status_idx" ON "applications"("status");
