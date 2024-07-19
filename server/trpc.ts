import { initTRPC } from "@trpc/server";
import { Context } from "./context";
import { isUserAuthed } from "./middlewares/isUserAuthed.middleware";
import { isAdminMiddleware } from "./middlewares/isAdmin.middleware";
import { getUser } from "./utils/getUser";

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure.use(async (opts: any) => {
  const { ctx, next, path } = opts;
  const { res } = ctx;
  const { accessToken, accessTokenPayload } = await getUser(res);

  return next({
    ctx: {
      ...ctx,
      user: accessTokenPayload ? accessTokenPayload : accessToken,
    },
  });
});
export const userProtectedProcedure = t.procedure.use(isUserAuthed);
export const adminProtectedProcedure = t.procedure.use(isAdminMiddleware);
