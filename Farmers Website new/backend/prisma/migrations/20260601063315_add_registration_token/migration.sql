/*
  Warnings:

  - You are about to drop the column `storeFollows` on the `users` table. All the data in the column will be lost.
  - Changed the type of `status` on the `order_tracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationPreference" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "CommissionFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING';
ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- DropForeignKey
ALTER TABLE "order_tracking" DROP CONSTRAINT "order_tracking_orderId_fkey";

-- DropForeignKey
ALTER TABLE "store_followers" DROP CONSTRAINT "store_followers_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "store_followers" DROP CONSTRAINT "store_followers_userId_fkey";

-- DropForeignKey
ALTER TABLE "store_reviews" DROP CONSTRAINT "store_reviews_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "store_reviews" DROP CONSTRAINT "store_reviews_userId_fkey";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "commissionFrequency" "CommissionFrequency",
ADD COLUMN     "notificationPreference" "NotificationPreference" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "photoWithIdUrl" TEXT,
ALTER COLUMN "hashedPassword" DROP NOT NULL;

-- AlterTable
ALTER TABLE "farmer_profiles" ADD COLUMN     "commissionFrequency" "CommissionFrequency" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "order_tracking" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "buyerNotes" TEXT,
ADD COLUMN     "logisticsAssignedAt" TIMESTAMP(3),
ADD COLUMN     "logisticsProvider" TEXT;

-- AlterTable
ALTER TABLE "store_reviews" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "storeFollows",
ADD COLUMN     "accountSetupCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "admin_commissions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "totalOrderSum" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0.05,
    "commissionFee" DECIMAL(10,2) NOT NULL,
    "paymentDeadline" "CommissionFrequency" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_commissions_orderId_key" ON "admin_commissions"("orderId");

-- CreateIndex
CREATE INDEX "admin_commissions_farmerId_idx" ON "admin_commissions"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "registration_tokens_token_key" ON "registration_tokens"("token");

-- CreateIndex
CREATE INDEX "registration_tokens_userId_idx" ON "registration_tokens"("userId");

-- AddForeignKey
ALTER TABLE "store_followers" ADD CONSTRAINT "store_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_followers" ADD CONSTRAINT "store_followers_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_reviews" ADD CONSTRAINT "store_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_commissions" ADD CONSTRAINT "admin_commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_commissions" ADD CONSTRAINT "admin_commissions_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_tokens" ADD CONSTRAINT "registration_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
