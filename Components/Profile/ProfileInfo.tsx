import { trpc } from "@/utils/trpc";
import React, { useEffect } from "react";
import { Edit_Svg } from "../SVGS";
import { useThemeStore } from "../ThemeController";

export default function ProfileInfo() {
  const setThemeStore = useThemeStore.setState;
  const {
    data: userInfoData,
    isLoading,
    error: userInfoError,
  } = trpc.user.userInfo.useQuery();
  const { mutate: mutateLogout, data: logoutData } =
    trpc.user.logout.useMutation();
  const { user } = trpc.useUtils();
  useEffect(() => {
    if (logoutData?.isUserLoggedout) {
      (async () => {
        await user.userInfo.invalidate();
        await user.userInfo.refetch();
      })();
    }
  }, [logoutData]);

  useEffect(() => {
    if (JSON.parse(userInfoError?.message || "{}").text === "please log in") {
      setThemeStore((state) => ({ ...state, openAuthModal: true }));
    }
  }, [userInfoError]);
  return (
    <div className="flex flex-col gap-3 h-full relative">
      {!isLoading && userInfoData ? (
        <>
          <div>
            <span>نام: </span>
            <span>{userInfoData.name}</span>
          </div>
          <div>
            <span>نام خانوادگی: </span>
            <span>{userInfoData.familyName}</span>
          </div>
          <div>
            <span>شماره موبایل: </span>
            <span>{userInfoData.phoneNumber}</span>
          </div>
          <div>
            <span>ایمیل: </span>
            <span>{userInfoData.email}</span>
          </div>
          <div
            onClick={() => mutateLogout()}
            className="bg-red-50 w-fit px-4 py-2 rounded-[10px] mt-6"
          >
            <span className="text-red-700">خروج از حساب</span>
          </div>
          <div className="flex bg-green1 rounded-[12px] px-4 py-2  flex-row  items-center gap-1 fixed bottom-[80px] right-[20px]">
            <Edit_Svg classname="w-8 h-auto fill-white" />
            <span className="font-[400] text-white">ویرایش اطلاعات</span>
          </div>
        </>
      ) : null}
    </div>
  );
}
