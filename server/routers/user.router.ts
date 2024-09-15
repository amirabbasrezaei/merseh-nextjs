import {
  LogoutPayloadSchema,
  SendVerifyCodeSchema,
  UserInfoResponsePayload,
  VerifyLoginCodeSchema,
  createUserController,
  createUserSchema,
  logoutController,
  sendVerifyCodeController,
  userInfoController,
  users,
  verifyLoginCodeController,
} from "../Controllers/user.controller";
import { router, publicProcedure, userProtectedProcedure, adminProtectedProcedure } from "../trpc";

export const userRouter = router({
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(createUserController),
  sendVerifyCode: publicProcedure
    .input(SendVerifyCodeSchema)
    .mutation(sendVerifyCodeController),
  verifyLoginCode: publicProcedure
    .input(VerifyLoginCodeSchema)
    .mutation(verifyLoginCodeController),
  users: publicProcedure.query(users),
  logout: userProtectedProcedure
    .output(LogoutPayloadSchema)
    .mutation(logoutController),
  userInfo: userProtectedProcedure.output(UserInfoResponsePayload).query(userInfoController)
});
