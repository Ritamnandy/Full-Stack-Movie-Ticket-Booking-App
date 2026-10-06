-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'DELETED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "google_id" TEXT,
    "refresh_token" TEXT,
    "profile_image" TEXT,
    "user_role" "UserRole" NOT NULL DEFAULT 'USER',
    "user_status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");
