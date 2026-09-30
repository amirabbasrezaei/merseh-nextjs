-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BannerPlacement" AS ENUM ('HERO', 'SIDE');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- Backfill existing content as published so the storefront stays populated
UPDATE "Article" SET "status" = 'PUBLISHED';
UPDATE "Product" SET "status" = 'PUBLISHED';

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "placement" "BannerPlacement" NOT NULL,
    "title" TEXT,
    "href" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banner_imageFileId_key" ON "Banner"("imageFileId");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
