-- CreateEnum
CREATE TYPE "HomeCarouselSource" AS ENUM ('CATEGORY', 'BRAND', 'MANUAL');

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "englishName" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeCarousel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "logoFileId" TEXT,
    "source" "HomeCarouselSource" NOT NULL,
    "categoryId" INTEGER,
    "brandId" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeCarousel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeCarouselProduct" (
    "carouselId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HomeCarouselProduct_pkey" PRIMARY KEY ("carouselId","productId")
);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "brandId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_logoFileId_key" ON "Brand"("logoFileId");

-- CreateIndex
CREATE INDEX "Brand_isActive_idx" ON "Brand"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "HomeCarousel_logoFileId_key" ON "HomeCarousel"("logoFileId");

-- CreateIndex
CREATE INDEX "HomeCarousel_isActive_sortOrder_idx" ON "HomeCarousel"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "HomeCarousel_categoryId_idx" ON "HomeCarousel"("categoryId");

-- CreateIndex
CREATE INDEX "HomeCarousel_brandId_idx" ON "HomeCarousel"("brandId");

-- CreateIndex
CREATE INDEX "HomeCarouselProduct_productId_idx" ON "HomeCarouselProduct"("productId");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeCarousel" ADD CONSTRAINT "HomeCarousel_logoFileId_fkey" FOREIGN KEY ("logoFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeCarousel" ADD CONSTRAINT "HomeCarousel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeCarousel" ADD CONSTRAINT "HomeCarousel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeCarouselProduct" ADD CONSTRAINT "HomeCarouselProduct_carouselId_fkey" FOREIGN KEY ("carouselId") REFERENCES "HomeCarousel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeCarouselProduct" ADD CONSTRAINT "HomeCarouselProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the current homepage sections when those categories exist
INSERT INTO "HomeCarousel" ("title", "source", "categoryId", "sortOrder", "isActive", "updatedAt")
SELECT 'روغن های گیاهی', 'CATEGORY'::"HomeCarouselSource", 2, 0, true, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Category" WHERE "id" = 2);

INSERT INTO "HomeCarousel" ("title", "source", "categoryId", "sortOrder", "isActive", "updatedAt")
SELECT 'محصولات جدید', 'CATEGORY'::"HomeCarouselSource", 1, 1, true, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "Category" WHERE "id" = 1);
