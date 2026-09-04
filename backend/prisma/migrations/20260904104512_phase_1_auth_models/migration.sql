-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google', 'apple', 'whatsapp');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'BASIC', 'PREMIUM', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('INSTANT', 'ADMIN_APPROVAL_REQUIRED');

-- CreateEnum
CREATE TYPE "PayoutFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'email',
    "providerId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "bio" TEXT,
    "profilePhoto" TEXT,
    "cityId" TEXT,
    "gender" TEXT,
    "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servesTourists" BOOLEAN NOT NULL DEFAULT true,
    "servesLocals" BOOLEAN NOT NULL DEFAULT false,
    "specializationTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationLevel" TEXT,
    "verificationExpiresAt" TIMESTAMP(3),
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION,
    "bookingMode" "BookingMode" NOT NULL DEFAULT 'INSTANT',
    "payoutFrequency" "PayoutFrequency" NOT NULL DEFAULT 'WEEKLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_role_permissions" (
    "adminUserId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("adminUserId","permissionId")
);

-- CreateTable
CREATE TABLE "site_feature_toggles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_feature_toggles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "companions_email_key" ON "companions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companions_phone_key" ON "companions"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "site_feature_toggles_key_key" ON "site_feature_toggles"("key");

-- AddForeignKey
ALTER TABLE "companions" ADD CONSTRAINT "companions_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
