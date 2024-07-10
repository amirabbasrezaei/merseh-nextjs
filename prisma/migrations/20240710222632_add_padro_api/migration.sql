/*
  Warnings:

  - The primary key for the `ShippingPartner` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shippingPartnerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderShipping" DROP CONSTRAINT "OrderShipping_shippingPartnerId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "podroRequestId" TEXT,
ALTER COLUMN "shippingPartnerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "OrderShipping" ALTER COLUMN "shippingPartnerId" DROP NOT NULL,
ALTER COLUMN "shippingPartnerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ShippingPartner" DROP CONSTRAINT "ShippingPartner_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ShippingPartner_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ShippingPartner_id_seq";

-- AddForeignKey
ALTER TABLE "OrderShipping" ADD CONSTRAINT "OrderShipping_shippingPartnerId_fkey" FOREIGN KEY ("shippingPartnerId") REFERENCES "ShippingPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingPartnerId_fkey" FOREIGN KEY ("shippingPartnerId") REFERENCES "ShippingPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
