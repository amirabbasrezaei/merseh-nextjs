import { TRPCError } from "@trpc/server";
import { Context } from "../context";
import { getUser } from "../utils/getUser";
interface IsUserAuthed {
  next: any;
  ctx: Context;
}

// interface NextArgs extends Context {
//   user: object
// }

export const isUserAuthed = async ({ ctx, next }: IsUserAuthed) => {
  const {  res } = ctx;
  
  const { accessToken, accessTokenPayload } = await getUser( res);
  // console.log("user", accessTokenPayload ? accessTokenPayload :  accessToken);
  if (!accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "you are not authorize to request"
    });
  }

  return next({
    ctx: { ...ctx, user: accessTokenPayload ? accessTokenPayload :  accessToken},
  });
};


