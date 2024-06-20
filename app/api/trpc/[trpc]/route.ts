import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";


const handler = (req: Request, res: Response) =>
    fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: async ({req }) => await createContext({req, res})
    });
export { handler as GET, handler as POST };
