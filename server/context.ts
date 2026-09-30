import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function resolveDatabaseUrl(): string {
  const fromEnv =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL
      : process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;

  if (fromEnv) {
    return fromEnv;
  }

  const user = process.env.POSTGRES_USER || "postgres";
  const password = process.env.POSTGRES_PASSWORD || "merseh";
  const db = process.env.POSTGRES_DB || "merseh";
  const port = process.env.POSTGRES_PORT || "5435";

  return `postgresql://${user}:${encodeURIComponent(password)}@127.0.0.1:${port}/${db}`;
}

const connectionString = resolveDatabaseUrl();

// Bump when the Prisma schema changes so a hot reload drops a stale client.
const PRISMA_CLIENT_VERSION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: number | undefined;
  pool: Pool | undefined;
  poolUrl: string | undefined;
};

function getPool(): Pool {
  if (globalForPrisma.pool && globalForPrisma.poolUrl === connectionString) {
    return globalForPrisma.pool;
  }

  if (globalForPrisma.pool) {
    void globalForPrisma.pool.end().catch(() => undefined);
  }

  const pool = new Pool({ connectionString });
  globalForPrisma.pool = pool;
  globalForPrisma.poolUrl = connectionString;
  return pool;
}

const pool = getPool();
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma &&
  globalForPrisma.prismaVersion === PRISMA_CLIENT_VERSION &&
  globalForPrisma.poolUrl === connectionString
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  globalForPrisma.pool = pool;
  globalForPrisma.poolUrl = connectionString;
}

export type createContextPayload = {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  user?: null | any;
};

export const createContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<createContextPayload> => {
  return {
    prisma,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
