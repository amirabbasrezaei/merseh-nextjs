import {
  LogoutPayloadSchema,
  LoginWithPasswordSchema,
  SendVerifyCodeSchema,
  UpdateAdminPasswordSchema,
  UpdateAdminPhoneSchema,
  UpdateProfileSchema,
  UserInfoResponsePayload,
  VerifyLoginCodeSchema,
  createUserController,
  createUserSchema,
  loginWithPasswordController,
  logoutController,
  sendVerifyCodeController,
  updateAdminPasswordController,
  updateAdminPhoneController,
  updateProfileController,
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
  loginWithPassword: publicProcedure
    .input(LoginWithPasswordSchema)
    .mutation(loginWithPasswordController),
  users: adminProtectedProcedure.query(users),
  updateAdminPhone: adminProtectedProcedure
    .input(UpdateAdminPhoneSchema)
    .mutation(updateAdminPhoneController),
  updateAdminPassword: adminProtectedProcedure
    .input(UpdateAdminPasswordSchema)
    .mutation(updateAdminPasswordController),
  logout: userProtectedProcedure
    .output(LogoutPayloadSchema)
    .mutation(logoutController),
  userInfo: userProtectedProcedure.output(UserInfoResponsePayload).query(userInfoController),
  updateProfile: userProtectedProcedure
    .input(UpdateProfileSchema)
    .output(UserInfoResponsePayload)
    .mutation(updateProfileController),
});
