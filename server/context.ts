import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        // process.env.NODE_ENV === "production"
        // ?
        process.env.DATABASE_URL,
      // : process.env.DATABASE_URL_LOCAL,
    },
  },
});

export type createContextPayload = {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
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
  // const session = await getSession({ req: opts.req });

  return {
    prisma,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
