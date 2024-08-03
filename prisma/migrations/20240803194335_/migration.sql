-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isSuggested" BOOLEAN;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "metaDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
