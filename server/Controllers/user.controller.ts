import { Context } from "../context";
import { z } from "zod";
import { signJWT } from "../utils/signJWT";
import { TRPCError } from "@trpc/server";
import Prisma from "@prisma/client";
import { sendSMSCodeController } from "./sms.controller";
import { cookies } from "next/headers";
import { User } from "@prisma/client";

type UserRouterArgsController<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

/// create user

export const createUserSchema = z.object({
  phoneNumber: z.string(),
  nameAndFamily: z.string(),
  hash: z.string().optional(),
});
export type CreateUser = z.infer<typeof createUserSchema>;

type CreateUserPayload = {
  isUserCreated: boolean;
};

export async function createUserController({
  ctx,
  input,
}: UserRouterArgsController<CreateUser>): Promise<CreateUserPayload> {
  const { prisma } = ctx;
  const { phoneNumber, nameAndFamily } = input;
  
  const findUser = await prisma.user.findUnique({
    where: {
      phoneNumber,
    },
  });

  if (findUser?.isVerified) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "user already exists",
    });
  }

  const createdUser = await prisma.user.create({
    data: {
      phoneNumber,
      name: nameAndFamily,
      credit: Number(process.env.INITIAL_CREDIT as string),
    },
  });

  if (createdUser) {
    const generatedCode = Math.random().toString().substring(2, 7);

    const body = {
      bodyId: 232336,
      to: input.phoneNumber,
      args: [String(generatedCode)],
    };

    const { status: tokenCodeStatus } = await sendSMSCodeController({
      body,
    });

    if (tokenCodeStatus !== "ارسال موفق بود") {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "مشکل در ارسال کد تایید",
      });
    }

    const updateUser = await prisma.user.update({
      where: {
        phoneNumber: input.phoneNumber,
      },
      data: {
        loginCode: generatedCode,
      },
    });

    if (!updateUser)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: "creating login code",
      });

    return { isUserCreated: true };
  }

  return { isUserCreated: false };
}

////

//// login user
export const SendVerifyCodeSchema = z.object({
  phoneNumber: z.string(),
  hash: z.string().optional(),
});
export type SendVerifyCode = z.infer<typeof SendVerifyCodeSchema>;

type SendVerifyCodeControllerPayload = {
  status: string;
  isNewUser: boolean;
};

export async function sendVerifyCodeController({
  ctx,
  input,
}: UserRouterArgsController<SendVerifyCode>): Promise<SendVerifyCodeControllerPayload> {
  const { prisma } = ctx;

  if (!input.phoneNumber) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "phonenumber is invalid",
      cause: "phonenumber is invalid",
    });
  }

  const findUser = await prisma.user.findUnique({
    where: {
      phoneNumber: input.phoneNumber,
    },
  });

  if (!findUser) {
    return { status: "ok", isNewUser: true };
  }
  const generatedCode = Math.random().toString().substring(2, 7);

  const body = {
    bodyId: 232336,
    to: input.phoneNumber,
    args: [String(generatedCode)],
  };

  const { status: tokenCodeStatus } = await sendSMSCodeController({
    body,
  });

  if (tokenCodeStatus !== "ارسال موفق بود") {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "مشکل در ارسال کد تایید",
    });
  }

  const updateUser = await prisma.user.update({
    where: {
      phoneNumber: input.phoneNumber,
    },
    data: {
      loginCode: generatedCode,
    },
  });
  if (!updateUser)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: "creating login code",
    });

  return { status: "ok", isNewUser: false };
}
////

//// verify login code
export const VerifyLoginCodeSchema = z.object({
  code: z.string().length(5),
  phoneNumber: z.string().max(13),
});
export type VerifyLoginCode = z.infer<typeof VerifyLoginCodeSchema>;
export async function verifyLoginCodeController({
  ctx,
  input,
}: UserRouterArgsController<VerifyLoginCode>) {
  const { code, phoneNumber } = input;
  const findUser = await ctx.prisma.user.findUnique({
    where: {
      phoneNumber,
    },
  });

  if (!findUser) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "user doesn't found",
      cause: "you didn't signup",
    });
  }

  if (findUser?.loginCode != code) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "inputs are not valid",
      cause: "phonenumber or code is invalid",
    });
  }

  if (!findUser.isVerified) {
    try {
      await ctx.prisma.user.update({
        data: {
          isVerified: true,
        },
        where: {
          phoneNumber,
        },
      });
    } catch (error: any) {
      throw Error(error);
    }
  }

  return signJWT({ res: ctx.res, user: findUser }).then(
    ({ accessToken, refreshToken }) => {
      return { accessToken, refreshToken };
    }
  );
}

////

//// Logout

export const LogoutPayloadSchema = z.object({
  isUserLoggedout: z.boolean(),
});

export type LogoutController =
  | {
      isUserLoggedout: boolean;
    }
  | TRPCError;
export type LogoutPayload = z.infer<typeof LogoutPayloadSchema>;
export async function logoutController({
  ctx,
}: UserRouterArgsController): Promise<LogoutPayload> {
  const { prisma } = ctx;
  const refreshToken = cookies().get("refreshToken")?.value;
  try {
    await prisma.session.delete({
      where: {
        id: refreshToken,
      },
    });
  } catch (error) {
    console.log(error);
  }
  cookies().delete("accessToken");
  cookies().delete("refreshToken");

  return { isUserLoggedout: true };
}

////

//// users list

export async function users({
  ctx,
}: UserRouterArgsController): Promise<Prisma.User[]> {
  const { prisma } = ctx;
  const users = await prisma.user.findMany();
  return users;
}

//// user info list

export const UserInfoResponsePayload = z.object({
  id: z.string().optional(),
  name: z.string(),
  familyName: z.string().nullable(),
  email: z.string().nullable().optional(),
  phoneNumber: z.string(),
  isVerified: z.boolean(),
  credit: z.number().optional(),
  createdAt: z.date().optional(),
  lastLogin: z.date().nullable().optional(),
  numberOfLogins: z.number().nullable().optional(),
});

export type UserInfoResponse =
  | z.infer<typeof UserInfoResponsePayload>


export async function userInfoController({
  ctx,
}: UserRouterArgsController): Promise<UserInfoResponse> {
  const { prisma, user } = ctx;
  if (!user.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const findUser = await prisma.user.findUnique({
      where: {
        id: user.userId,
      },
    });
    if (!findUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "user not found, please log in",
      });
    }
    return {
      name: findUser.name,
      familyName: findUser.familyName ,
      isVerified: findUser.isVerified,
      phoneNumber: findUser.phoneNumber

    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "problem in finding user",
    });
  }
}


