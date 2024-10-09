import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { themeRecoilStateAtom } from "./ThemeController";
import { trpc } from "@/utils/trpc";
import Skeleton from "react-loading-skeleton";
import { Login_icon, Profile_Svg } from "./SVGS";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Auth from "./Auth/Auth";
import { useRouter } from "next/navigation";
import classNames from "classnames";

type UserInfo = {
  name: string;
  familyName: string;
  phoneNumber: string;
} | null;

export const userInfoStoreAtom = atom<UserInfo>({
  key: "userInfo",
  default: null,
});

const animation = {
  open: {
    height: 155,
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.3,
      delayChildren: 0.2,
      staggerChildren: 0.05,
    },
  },
  hidden: {
    height: 15,
    type: "spring",
    bounce: 0,
    duration: 0.3,
  },
};

const ItemsAnimation = {
  open: {
    opacity: 1,
    y: 0,

    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export default function UserAuth() {
  const [userInfo, setUserInfo] = useRecoilState(userInfoStoreAtom);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { data, isLoading, error } = trpc.user.userInfo.useQuery(undefined, {
    retry: false,
    networkMode: "online",
    cacheTime: 0,
  });

  const { user } = trpc.useUtils();
  const { mutate: mutateLogout, data: logoutData } =
    trpc.user.logout.useMutation();
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

  useEffect(() => {
    if (logoutData?.isUserLoggedout) {
      (async () => {
        await user.userInfo.invalidate();
        await user.userInfo.refetch();
      })();
    }
  }, [logoutData]);

  return (
    <div className="hidden sm:flex relative">
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
      ) : data?.isVerified && !error?.data ? (
        <div className="w-[100px] h-[36px] relative flex justify-center items-center">
          <motion.div
            initial={false}
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
            variants={animation}
            animate={showUserMenu ? "open" : "hidden"}
            className={classNames(
              "flex absolute bg-white  flex-col cursor-pointer top-[-10px]  origin-top hover:border border-gray-100 px-2 py-2 rounded-[10px]  items-center gap-3 w-fit ",
              showUserMenu ? "z-10" : "z-0"
            )}
          >
            <motion.div
              onClick={() => router.push("/profile")}
              className="flex flex-row items-center gap-1 w-full justify-center py-2 px-3 rounded-[8px] hover:bg-gray-50"
            >
              <Profile_Svg classname="w-[24px] h-auto stroke-[#303030]" />
              <span className="text-[#303030] font-[400] text-[13px] w-fit">{`${
                data?.name
              } ${data?.familyName ?? ""}`}</span>
            </motion.div>
            <motion.div
              variants={ItemsAnimation}
              onClick={() => router.push("/profile/orders")}
              className={classNames(
                "   gap-5  h-fit flex flex-col w-full items-center justify-center py-2 px-3 rounded-[8px] hover:bg-gray-50",
                showUserMenu ? "visible" : "hidden"
              )}
            >
              <motion.span className="text-[14px] w-fit">سفارش‌ها</motion.span>
            </motion.div>
            <motion.div
              variants={ItemsAnimation}
              className={classNames(
                " w-full justify-center items-center py-2 px-3 rounded-[8px] hover:bg-gray-50  gap-5  h-fit flex flex-col",
                showUserMenu ? "visible" : "hidden"
              )}
              onClick={() => mutateLogout()}
            >
              <motion.span className="text-[14px] text-nowrap">
                خروج از حساب
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <>
          <div
            onClick={() =>
              setThemeStore((state) => ({ ...state, openAuthModal: true }))
            }
            className="flex flex-row justify-center items-center gap-2 hover:bg-hover1  px-4 py-2 rounded-[10px] cursor-pointer w-[160px]"
          >
            <span className="text-[16px] text-black1 font-[500]">
              ورود | عضویت
            </span>
            <Login_icon classname="w-[15px] h-auto mt-[2px] fill-[#303030]" />
          </div>

          {process.browser
            ? createPortal(
                <AnimatePresence mode="sync">
                  {themeStore.openAuthModal && (
                    <motion.div
                      key="portal"
                      animate={{
                        opacity: 1,
                        backdropFilter: "blur(2px) brightness(85%)",
                      }}
                      exit={{
                        opacity: 0,
                        backdropFilter: "blur(0px) brightness(100%)",
                      }}
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
                      <motion.div
                        initial={{
                          translateY: 100,
                        }}
                        animate={{
                          translateY: 0,
                        }}
                        exit={{
                          translateY: -50,
                        }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.3,
                        }}
                      >
                        <Auth setShowAuthModal={setThemeStore} isModal={true} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>,
                document.body
              )
            : null}
        </>
      )}
    </div>
  );
}
