import { TRPCError } from "@trpc/server";
import { Context } from "../context";
import { getUser } from "../utils/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
interface IsUserAuthed {
  next: any;
  ctx: Context;
}

// interface NextArgs extends Context {
//   user: object
// }

export const isUserAuthed = async ({ ctx, next }: IsUserAuthed) => {
  cookies().set("AuthorizeStatus", "", { httpOnly: true });
  const { res } = ctx;

  const { accessToken, accessTokenPayload } = await getUser(res);
  // console.log("user", accessTokenPayload ? accessTokenPayload :  accessToken);
  if (!accessToken) {
    // @ts-ignore
    const accessToRestrictrdPaths = res.params.trpc
      .split(",")
      .map((route: any) => route.split("."))
      .map((e: any, i: number) => e[1])
      .filter((e: any) => e !== "userInfo").length;

    if (accessToRestrictrdPaths) {
      cookies().set("AuthorizeStatus", "need_login", { httpOnly: true });
    }

    cookies().set("AuthorizeStatus", "need_login", { httpOnly: true });
    throw new TRPCError({
      code: "UNAUTHORIZED",
      cause: "you are not authorize to request",
      message: "please log in",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: accessTokenPayload ? accessTokenPayload : accessToken,
    },
  });
};