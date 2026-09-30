import type { SeedPrisma } from "./types";

export async function resetDatabase(prisma: SeedPrisma) {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (!tables.length) {
    console.log("No tables to truncate");
    return;
  }

  const list = tables.map((table) => `"${table.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`
  );
  console.log(`Reset ${tables.length} tables`);
}
