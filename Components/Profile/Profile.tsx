"use client";

import React, { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { useThemeStore } from "../ThemeController";
import { Login_icon, Profile_Svg } from "../SVGS";
import ProfileNav from "./ProfileNav";
import ProfileInfo from "./ProfileInfo";
import ProfileAddresses from "./ProfileAddresses";
import Orders from "./Orders";
import type { ProfileSectionId } from "./sections";
import { EmptyState, SkeletonBlock, buttonClass } from "./ui/ProfileCard";

type Props = {
  section: ProfileSectionId;
};

export default function Profile({ section }: Props) {
  const setThemeStore = useThemeStore.setState;
  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = trpc.user.userInfo.useQuery(undefined, { retry: false });

  const needsLogin = error?.data?.code === "UNAUTHORIZED";
  const isSignedIn = Boolean(userInfo) && !error;

  // Prompt only when the page is opened signed out, not after logging out here.
  const hadUser = useRef(false);
  useEffect(() => {
    if (isSignedIn) hadUser.current = true;
  }, [isSignedIn]);
  useEffect(() => {
    if (needsLogin && !hadUser.current) {
      setThemeStore({ openAuthModal: true });
    }
  }, [needsLogin, setThemeStore]);

  return (
    <section className="flex w-full flex-col gap-6 sm:px-5 md:flex-row md:items-start md:gap-8">
      <ProfileNav active={section} />

      <div className="min-w-0 flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-5">
            <SkeletonBlock className="h-40 rounded-panel" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
            </div>
            <SkeletonBlock className="h-64 rounded-tile" />
          </div>
        ) : isSignedIn && userInfo ? (
          section === "account" ? (
            <ProfileInfo user={userInfo} />
          ) : section === "addresses" ? (
            <ProfileAddresses />
          ) : (
            <Orders />
          )
        ) : needsLogin ? (
          <EmptyState
            icon={<Profile_Svg classname="h-7 w-7 stroke-mauve-700" />}
            title="وارد حساب کاربری خود شوید"
            description="برای مشاهده اطلاعات حساب، آدرس‌ها و سفارش‌ها ابتدا وارد شوید."
            action={
              <button
                type="button"
                onClick={() => setThemeStore({ openAuthModal: true })}
                className={buttonClass("primary")}
              >
                <Login_icon classname="h-auto w-[14px] fill-white" />
                ورود | عضویت
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={<Profile_Svg classname="h-7 w-7 stroke-mauve-700" />}
            title="دریافت اطلاعات حساب ممکن نشد"
            description="اتصال خود را بررسی کنید و دوباره تلاش کنید."
            action={
              <button
                type="button"
                onClick={() => refetch()}
                className={buttonClass("secondary")}
              >
                تلاش دوباره
              </button>
            }
          />
        )}
      </div>
    </section>
  );
}
