-- Greenfield-safe migration: central File model + gallery join tables.
-- Drops legacy string image columns in favor of File FKs.

-- Drop old image columns (ignore if already gone on fresh DBs that never had them via later schema)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "imageNames";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "images";
ALTER TABLE "Category" DROP COLUMN IF EXISTS "imageName";
ALTER TABLE "ShippingPartner" DROP COLUMN IF EXISTS "imageName";

-- FileKind enum
DO $$ BEGIN
  CREATE TYPE "FileKind" AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- File table
CREATE TABLE IF NOT EXISTS "File" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "kind" "FileKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "File_key_key" ON "File"("key");

-- Product gallery join
CREATE TABLE IF NOT EXISTS "ProductGalleryFile" (
    "productId" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductGalleryFile_pkey" PRIMARY KEY ("productId","fileId")
);

-- Article gallery join
CREATE TABLE IF NOT EXISTS "ArticleGalleryFile" (
    "articleId" INTEGER NOT NULL,
    "fileId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ArticleGalleryFile_pkey" PRIMARY KEY ("articleId","fileId")
);

-- Category.imageFileId
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageFileId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Category_imageFileId_key" ON "Category"("imageFileId");

-- ShippingPartner.imageFileId
ALTER TABLE "ShippingPartner" ADD COLUMN IF NOT EXISTS "imageFileId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ShippingPartner_imageFileId_key" ON "ShippingPartner"("imageFileId");

-- Foreign keys (guarded)
DO $$ BEGIN
  ALTER TABLE "ProductGalleryFile" ADD CONSTRAINT "ProductGalleryFile_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "ProductGalleryFile" ADD CONSTRAINT "ProductGalleryFile_fileId_fkey"
    FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "ArticleGalleryFile" ADD CONSTRAINT "ArticleGalleryFile_articleId_fkey"
    FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "ArticleGalleryFile" ADD CONSTRAINT "ArticleGalleryFile_fileId_fkey"
    FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "Category" ADD CONSTRAINT "Category_imageFileId_fkey"
    FOREIGN KEY ("imageFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "ShippingPartner" ADD CONSTRAINT "ShippingPartner_imageFileId_fkey"
    FOREIGN KEY ("imageFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
