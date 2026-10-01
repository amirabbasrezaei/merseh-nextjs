-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('FREE_SHIPPING', 'PERCENT', 'FIXED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "couponDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "couponId" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "freeShipping" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ShippingPartner" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "minSubtotal" INTEGER,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

-- CreateIndex
CREATE INDEX "ShippingPartner_isActive_idx" ON "ShippingPartner"("isActive");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Checkout offers only these carriers. They stay inactive until an admin sets a price.
INSERT INTO "ShippingPartner" ("id", "name")
SELECT gen_random_uuid()::text, carrier.name
FROM (VALUES ('پست پیشتاز'), ('تیپاکس'), ('چاپار')) AS carrier(name)
WHERE NOT EXISTS (
  SELECT 1 FROM "ShippingPartner" existing WHERE existing."name" = carrier.name
);

UPDATE "ShippingPartner"
SET "sortOrder" = CASE "name"
  WHEN 'پست پیشتاز' THEN 1
  WHEN 'تیپاکس' THEN 2
  WHEN 'چاپار' THEN 3
  ELSE 99
END;

-- Live Podro/Miare quotes are no longer used, so old selections are dropped.
DELETE FROM "OrderShipping"
WHERE "orderId" IN (SELECT "id" FROM "Order" WHERE "status" = 'ACTIVE');
