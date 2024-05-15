import { prisma } from "../context";
import jwt, { Secret } from "jsonwebtoken";
import { Session, User } from "prisma/prisma-client";
import { AccessTokenPayload, RefreshTokenPayload, signJWT } from "./signJWT";
import { TRPCError } from "@trpc/server";
import type { TRPCError as Error } from "@trpc/server";

import { cookies } from "next/headers";

type GetUserSession = {
  session: Session | null;
  user: User | null;
};

async function getUserSession(sessionId: string): Promise<GetUserSession> {
  try {
   
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    console.log(sessionId)
    if (session) {
      const [user] = await prisma.$transaction([
        prisma.user.findUnique({
          where: {
            id: session.userId,
          },
        }),
        prisma.user.update({
          where: { id: session.userId },
          data: {
            lastLogin: new Date(Date.now()),
            numberOfLogins: { increment: 1 },
          },
        }),
      ]);

      if (user !== null) {
        return { user, session };
      }
      return { session: null, user: null };
    }
    return { session: null, user: null };
  } catch (error) {
    // throw new TRPCError({
    //   code: "UNAUTHORIZED",
    //   cause: "لطفا وارد حساب کاربری خود شوید",
    // });
    console.log(error);
    return { session: null, user: null };
  }
}

async function checkRefreshToken(): Promise<{ user: User | null }> {
  const refreshToken = cookies().get("refreshToken")?.value;
  
  if (refreshToken) {
    const verifyRefreshToken = jwt.verify(
      refreshToken,
      process.env.JWT_PRIVATE_KEY as Secret
    );
    
    // @ts-ignore
    return await getUserSession(verifyRefreshToken.sessionId as string)
      .then(({ user }: any) => {
        
        return { user };
      })
      .catch((err) => {
        // throw new TRPCError({
        //   code: "UNAUTHORIZED",
        //   message: "you are not authorize to request",
        // });
        console.log(err);
        return null;
      });
  }
  return { user: null };
}

function checkAccessToken() {
  const accessToken = cookies().get("accessToken")?.value;
  if (accessToken) {
    const token = jwt.verify(
      accessToken,
      process.env.JWT_PRIVATE_KEY as Secret
    );
    return token;
  }
  return null;
}

type GetUser = {
  accessToken: jwt.JwtPayload | string | null;
  refreshToken: string | null;
  accessTokenPayload: AccessTokenPayload | null;
  refreshTokenPayload: RefreshTokenPayload | null;
};

export async function getUser(res: Response): Promise<GetUser> {
  const userWithAccessToken = checkAccessToken();
  if (userWithAccessToken) {

    return {
      accessToken: userWithAccessToken,
      refreshToken: null,
      accessTokenPayload: null,
      refreshTokenPayload: null,
    };
  }
  const payload: GetUser = await checkRefreshToken()
    .then(async ({ user }) => {
      if (!user) {
        return { accessToken: null, refreshToken: null };
      }
      const {
        accessToken,
        refreshToken,
        accessTokenPayload,
        refreshTokenPayload,
      } = await signJWT({ res, user });

      return {
        accessToken,
        refreshToken,
        accessTokenPayload,
        refreshTokenPayload,
      };
    })
    .then(
      ({
        accessToken,
        refreshToken,
        accessTokenPayload = null,
        refreshTokenPayload = null,
      }) => {
        return {
          accessToken,
          refreshToken,
          accessTokenPayload,
          refreshTokenPayload,
        };
      }
    );
  if (payload) {
    return payload;
  }

  return {
    accessToken: null,
    refreshToken: null,
    accessTokenPayload: null,
    refreshTokenPayload: null,
  };
}
