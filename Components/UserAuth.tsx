"use client";
import React, { useEffect, useRef, useState } from "react";
import { useThemeStore } from "./ThemeController";
import { useUserInfoStore } from "./stores/userInfoStore";
import { trpc } from "@/utils/trpc";
import Skeleton from "react-loading-skeleton";
import {
  Chevron_Down,
  Location_Pin,
  Login_icon,
  Logout_SVG,
  Order_Svg,
  Profile_Svg,
} from "./SVGS";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Auth from "./Auth/Auth";
import { useResetAccountQueries } from "./Auth/useResetAccountQueries";
import { useRouter } from "next/navigation";
import classNames from "classnames";

export { useUserInfoStore, type UserInfo } from "./stores/userInfoStore";

const itemMotion = {
  open: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.15 },
  },
};

export default function UserAuth() {
  const setUserInfo = useUserInfoStore((s) => s.setUserInfo);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { data, isLoading, error } = trpc.user.userInfo.useQuery(undefined, {
    retry: false,
    networkMode: "online",
    gcTime: 0,
  });

  const resetAccountQueries = useResetAccountQueries();
  const { mutate: mutateLogout, data: logoutData } =
    trpc.user.logout.useMutation();
  const themeStore = useThemeStore();
  const setThemeStore = useThemeStore.setState;

  useEffect(() => {
    if (data) {
      setUserInfo({
        name: data?.name,
        familyName: data.familyName || "",
        phoneNumber: data.phoneNumber,
      });
    }
  }, [data, setUserInfo]);

  useEffect(() => {
    if (logoutData?.isUserLoggedout) {
      resetAccountQueries();
    }
  }, [logoutData]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShowUserMenu(true);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShowUserMenu(false), 140);
  };

  const displayName =
    [data?.name, data?.familyName].filter(Boolean).join(" ") || "حساب کاربری";

  const menuMotion = {
    open: {
      height: "auto" as const,
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            height: { type: "spring" as const, bounce: 0, duration: 0.34 },
            opacity: { duration: 0.18 },
            delayChildren: 0.06,
            staggerChildren: 0.05,
          },
    },
    hidden: {
      height: 0,
      opacity: 0,
      transition: reduceMotion
        ? { duration: 0 }
        : {
            height: { type: "spring" as const, bounce: 0, duration: 0.26 },
            opacity: { duration: 0.12 },
          },
    },
  };

  return (
    <div className="hidden sm:flex relative">
      {isLoading ? (
        <div className="h-9 w-[130px] overflow-hidden rounded-full">
          <Skeleton
            baseColor="#F7EDE7"
            duration={1}
            highlightColor="#FCF8F5"
            enableAnimation
            direction="rtl"
            className="h-full "
          />
        </div>
      ) : data?.isVerified && !error?.data ? (
        <div
          className="relative"
          onMouseEnter={openMenu}
          onMouseLeave={closeMenu}
          onFocus={openMenu}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeMenu();
            }
          }}
        >
          <button
            type="button"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-controls="account-menu"
            onClick={() => router.push("/profile")}
            className={classNames(
              "home-focus flex h-11 max-w-[11.5rem] items-center gap-2 rounded-full py-1 pe-2.5 ps-1.5 text-plum-900 transition-colors",
              showUserMenu ? "bg-blush-100" : "hover:bg-blush-100",
            )}
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blush-200">
              <Profile_Svg classname="h-[18px] w-[18px] stroke-mauve-700" />
            </span>
            <span className="truncate text-[13px] font-medium">
              {displayName}
            </span>
            <Chevron_Down
              classname={classNames(
                "h-2.5 w-2.5 flex-none fill-mauve-700 transition-transform duration-300",
                showUserMenu && "rotate-180",
              )}
            />
          </button>

          <motion.div
            id="account-menu"
            initial={false}
            animate={showUserMenu ? "open" : "hidden"}
            variants={menuMotion}
            inert={!showUserMenu}
            aria-hidden={!showUserMenu}
            className="absolute start-0 top-full z-40 w-[15.5rem] origin-top overflow-hidden"
            style={{ pointerEvents: showUserMenu ? "auto" : "none" }}
          >
            <div className="px-1 pb-4 pt-2">
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-lift">
                <motion.div variants={itemMotion} className="px-3.5 pb-2.5 pt-3">
                  <p className="truncate text-[13px] font-medium text-plum-900">
                    {displayName}
                  </p>
                  <p className="mt-0.5 text-caption text-lightBlack">
                    {data.phoneNumber}
                  </p>
                </motion.div>

                <div className="mx-2 border-t border-hairline" />

                <div className="p-1.5">
                  <motion.button
                    type="button"
                    variants={itemMotion}
                    onClick={() => router.push("/profile")}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-plum-900 transition-colors hover:bg-blush-100"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sand">
                      <Profile_Svg classname="h-4 w-4 stroke-mauve-700" />
                    </span>
                    حساب کاربری
                  </motion.button>
                  <motion.button
                    type="button"
                    variants={itemMotion}
                    onClick={() => router.push("/profile/addresses")}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-plum-900 transition-colors hover:bg-blush-100"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sand">
                      <Location_Pin classname="h-3.5 w-3.5 fill-mauve-700" />
                    </span>
                    آدرس‌ها
                  </motion.button>
                  <motion.button
                    type="button"
                    variants={itemMotion}
                    onClick={() => router.push("/profile/orders")}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-plum-900 transition-colors hover:bg-blush-100"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sand">
                      <Order_Svg classname="h-4 w-4 fill-mauve-700" />
                    </span>
                    سفارش‌ها
                  </motion.button>
                </div>

                <div className="mx-2 border-t border-hairline" />

                <div className="p-1.5">
                  <motion.button
                    type="button"
                    variants={itemMotion}
                    onClick={() => mutateLogout()}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-mauve-700 transition-colors hover:bg-blush-100"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blush-100">
                      <Logout_SVG classname="h-4 w-4" />
                    </span>
                    خروج از حساب
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setThemeStore({ openAuthModal: true })}
            className="home-focus flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-hairline px-4 text-small font-medium text-plum-900 transition-colors hover:border-mauve-400 hover:bg-blush-100"
          >
            <Login_icon classname="h-auto w-[14px] fill-mauve-700" />
            ورود | عضویت
          </button>

          {typeof window !== "undefined"
            ? createPortal(
                <AnimatePresence mode="sync">
                  {themeStore.openAuthModal && (
                    <motion.div
                      key="portal"
                      initial={false}
                      animate={{
                        opacity: 1,
                        backdropFilter: "blur(2px) brightness(85%)",
                      }}
                      exit={{
                        opacity: 0,
                        backdropFilter: "blur(0px) brightness(100%)",
                      }}
                      transition={{ duration: 0.3 }}
                      onClick={() => {
                        setThemeStore({ openAuthModal: false });
                      }}
                      className="w-full h-full z-50 flex items-center justify-center fixed left-0 right-0 top-0 bottom-0 cursor-pointer"
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
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-default"
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
