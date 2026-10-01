import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedMohana } from "./seed/mohana";
import { seedCommerce } from "./seed/commerce";
import { seedEditorial } from "./seed/editorial";
import { seedLocations } from "./seed/locations";
import { assertMinioReady } from "./seed/media";
import { resetDatabase } from "./seed/reset";

const connectionString =
  process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DATABASE_URL_LOCAL is required for seeding");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!phone || !password) {
    throw new Error(
      "Set ADMIN_PHONE and ADMIN_PASSWORD in .env before seeding"
    );
  }

  await assertMinioReady();
  await resetDatabase(prisma);
  await seedLocations(prisma);
  const catalog = await seedMohana(prisma);
  const editorial = await seedEditorial(prisma, catalog);
  await seedCommerce(prisma, catalog, editorial);

  console.log("Mohana catalog seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
