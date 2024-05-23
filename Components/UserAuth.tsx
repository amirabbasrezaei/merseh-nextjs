import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { themeRecoilStateAtom } from "./ThemeController";
import { trpc } from "@/utils/trpc";
import Skeleton from "react-loading-skeleton";
import { Login_icon, Profile_Svg } from "./SVGS";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Auth from "./Auth/Auth";

type UserInfo = {
  name: string;
  familyName: string;
  phoneNumber: string;
} | null;

export const userInfoStoreAtom = atom<UserInfo>({
  key: "userInfo",
  default: null,
});

export default function UserAuth() {
  const [userInfo, setUserInfo] = useRecoilState(userInfoStoreAtom);

  const { data, status, isLoading, error } = trpc.user.userInfo.useQuery(
    undefined,
    {
      retry: false,
      networkMode: "online",
      gcTime: 0,
    }
  );
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);

  useEffect(() => {
    if (data) {
      setUserInfo({
        name: data?.name,
        familyName: data.familyName || "",
        phoneNumber: data.phoneNumber,
      });
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <div className="w-[130px] h-7 text-[#e9e9e9]">
          <Skeleton
            baseColor="#e9e9e9"
            duration={1}
            highlightColor="#fff"
            enableAnimation
            direction="rtl"
            className="h-full "
          />
        </div>
      ) : data?.isVerified ? (
        <div className="flex flex-row items-center gap-4 w-[130px] justify-center">
          <Profile_Svg classname="w-[17px] h-auto fill-[#303030]" />
          <span className="text-[#303030] font-[300] text-[13px]">{`${
            data?.name
          } ${data?.familyName ?? ""}`}</span>
        </div>
      ) : (
        <>
          <div
            onClick={() =>
              setThemeStore((state) => ({ ...state, openAuthModal: true }))
            }
            className="flex flex-row justify-center items-center gap-2 hover:bg-hover1  px-4 py-2 rounded-[10px] cursor-pointer w-[130px]"
          >
            <span className="text-[13px] text-black1 font-[400]">
              ورود | عضویت
            </span>
            <Login_icon classname="w-[15px] mt-[2px] fill-[#303030]" />
          </div>

          {createPortal(
            <AnimatePresence mode="sync">
              {themeStore.openAuthModal && (
                <motion.div
                  key="portal"
                  animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => {
                    setThemeStore((state) => ({
                      ...state,
                      openAuthModal: true,
                    }));
                    e.stopPropagation();
                  }}
                  className="w-full h-full z-20  flex items-center justify-center fixed left-0 right-0  top-0 bottom-0 "
                >
                  <Auth setShowAuthModal={setThemeStore} isModal={true} />
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      )}
    </>
  );
}
