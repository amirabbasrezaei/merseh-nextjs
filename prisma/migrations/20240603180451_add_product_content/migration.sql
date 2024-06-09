/*
  Warnings:

  - Added the required column `orderId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `trackId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `content` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "orderId" INTEGER NOT NULL,
ALTER COLUMN "trackId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "content" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
