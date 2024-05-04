import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import type {
  CreateNextContextOptions,
  NextApiRequest,
} from "@trpc/server/adapters/next";

export const prisma = new PrismaClient();

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
    res
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
