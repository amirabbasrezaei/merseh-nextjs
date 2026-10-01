import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const url = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
const CARRIERS = [["پست پیشتاز", 65000], ["تیپاکس", 85000], ["چاپار", 75000]] as const;
const CODES = ["TESTSHIP", "TEST10", "TESTMIN"];

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (mode === "show") {
    const carriers = await prisma.shippingPartner.findMany({
      select: { id: true, name: true, price: true, isActive: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });
    const coupons = await prisma.coupon.findMany();
    const order = await prisma.order.findFirst({
      where: { status: "ACTIVE", user: { phoneNumber: "09121112204" } },
      select: {
        id: true, addressId: true, couponCode: true, couponDiscount: true, finalPrice: true,
        ProductForOrder: { select: { numberOfproduct: true, Product: { select: { id: true, name: true, freeShipping: true } } } },
        OrderShipping: { select: { price: true, shippingPartnerId: true } },
      },
    });
    const freeProducts = await prisma.product.findMany({ where: { freeShipping: true }, select: { id: true, name: true } });
    console.log(JSON.stringify({ carriers, coupons, order, freeProducts }, null, 2));
  }
  if (mode === "seed") {
    for (const [name, price] of CARRIERS) {
      await prisma.shippingPartner.updateMany({ where: { name }, data: { price, isActive: true } });
    }
    await prisma.coupon.createMany({
      data: [
        { code: "TESTSHIP", type: "FREE_SHIPPING", value: 0 },
        { code: "TEST10", type: "PERCENT", value: 10 },
        { code: "TESTMIN", type: "FIXED", value: 50000, minSubtotal: 99000000 },
      ],
      skipDuplicates: true,
    });
  }
  if (mode === "setfree") {
    const [flag, ...ids] = args;
    await prisma.product.updateMany({ where: { id: { in: ids.map(Number) } }, data: { freeShipping: flag === "1" } });
  }
  if (mode === "restore") {
    await prisma.order.updateMany({ where: { couponCode: { in: CODES } , status: "ACTIVE" }, data: { couponId: null, couponCode: null, couponDiscount: 0 } });
    await prisma.coupon.deleteMany({ where: { code: { in: CODES } } });
    for (const [name] of CARRIERS) {
      await prisma.shippingPartner.updateMany({ where: { name }, data: { price: 0, isActive: false } });
    }
  }
}

main().finally(() => prisma.$disconnect());
