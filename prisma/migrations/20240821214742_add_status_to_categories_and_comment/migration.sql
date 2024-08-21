-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ENABLED', 'DISABLED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "status" "CategoryStatus" NOT NULL DEFAULT 'ENABLED';
