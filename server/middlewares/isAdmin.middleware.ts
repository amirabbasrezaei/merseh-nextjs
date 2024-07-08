import { TRPCError } from "@trpc/server";
import { Context } from "../context";
import { getUser } from "../utils/getUser";
import { JwtPayload } from "jsonwebtoken";

interface IsUserAuthed {
  next: any;
  ctx: Context;
  path: string;
}

// interface NextArgs extends Context {
//   user: object
// }

export const isAdminMiddleware = async (opts: IsUserAuthed) => {
  const { ctx, next, path } = opts;
  const { res } = ctx;

  const { accessToken, accessTokenPayload } = await getUser(res);

  if (!accessToken || (accessToken as JwtPayload)?.role !== "ADMIN") {
    throw new TRPCError({
      code: "UNAUTHORIZED",

      message:
        JSON.stringify({ need_login_now: false, text: "please log in" }) || "",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: accessTokenPayload ? accessTokenPayload : accessToken,
    },
  });
};
