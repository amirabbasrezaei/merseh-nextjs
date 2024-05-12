import { TRPCError } from "@trpc/server";
import { Context } from "../context";
import { getUser } from "../utils/getUser";
import { cookies } from "next/headers";

interface IsUserAuthed {
  next: any;
  ctx: Context;
  path: string;
}

// interface NextArgs extends Context {
//   user: object
// }

export const isUserAuthed = async (opts: IsUserAuthed) => {
  const { ctx, next, path } = opts;
  cookies().set("AuthorizeStatus", "", { httpOnly: true });
  const { res } = ctx;

  const { accessToken, accessTokenPayload } = await getUser(res);

  if (!accessToken) {

    if (path !== "user.userInfo" && path !== "order.getActiveOrder") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        cause:"",
        message: JSON.stringify({ need_login_now: true }) || "",
      });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",

      message: JSON.stringify({ need_login_now: false, text:"please log in" }) || "",
    });

  }

  return next({
    ctx: {
      ...ctx,
      user: accessTokenPayload ? accessTokenPayload : accessToken,
    },
  });
};
