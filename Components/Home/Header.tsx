"use client";
import React, { useEffect, useState } from "react";
import {
  Chevron_Down,
  Login_icon,
  Magnifier,
  MersehSvg,
  Profile_Svg,
  Shop_Cart,
} from "../SVGS";
import { trpc } from "@/utils/trpc";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { createPortal } from "react-dom";
import Auth from "../Auth/Auth";
import { AnimatePresence, motion } from "framer-motion";
import HeaderShoppingCart from "../Cart/HeaderShoppingCart";
import { useRecoilState } from "recoil";
import { themeRecoilStateAtom } from "../ThemeController";
export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const { data, status, isLoading } = trpc.user.userInfo.useQuery(undefined, {
    retry: false,
    networkMode: "online",
    gcTime: 0,
  });

  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  useEffect(() => {
    if (themeStore.openAuthModal) {
      setShowAuthModal(true);
    }
  }, [themeStore]);

  useEffect(() => {
    if (showAuthModal === false) {
      setThemeStore({ openAuthModal: false });
    }
  }, [showAuthModal]);

  return (
    <header className="h-[116px] px-6 w-full  flex items-center mb-[-70px] flex-none">
      <div className="flex items-center gap-12 basis-9/12  h-full ">
        <MersehSvg classname="max-w-[38px] basis-1/12 flex-none" />
        <div className=" basis-3/12 flex-none">
          <div className="flex flex-row justify-center  items-center gap-2 cursor-pointer">
            <span className="font-[400] text-black1 text-[14px] ">
              دسته‌بندی کالاها
            </span>
            <Chevron_Down classname="w-[11px]  fill-[#303030]" />
          </div>
        </div>

        <div className=" grow h-[50px] relative">
          <input
            placeholder="جستجو در میان محصولات"
            className="bg-[#F6F6F6] w-full h-full placeholder:text-[15px] text-black1 placeholder:text-[#8b8b8b] px-5 pr-[50px] grow rounded-[10px] appearance-none outline-none"
          />
          <Magnifier classname="absolute top-[15px] right-[15px] w-[20px] h-auto" />
        </div>
      </div>
      <div className="basis-3/12 flex flex-row justify-end gap-10 items-center">
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
            <span className="text-[#303030] font-[300] text-[13px]">{`${data?.name} ${data?.familyName}`}</span>
          </div>
        ) : (
          <>
            <div
              onClick={() => setShowAuthModal(true)}
              className="flex flex-row justify-center items-center gap-2 hover:bg-hover1  px-4 py-2 rounded-[10px] cursor-pointer w-[130px]"
            >
              <span className="text-[13px] text-black1 font-[400]">
                ورود | عضویت
              </span>
              <Login_icon classname="w-[15px] mt-[2px] fill-[#303030]" />
            </div>

            {createPortal(
              <AnimatePresence mode="wait">
                {showAuthModal && (
                  <motion.div
                    key="portal"
                    animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => {
                      setShowAuthModal(false);
                      e.stopPropagation();
                    }}
                    className="w-full h-full   flex items-center justify-center fixed left-0 right-0  top-0 bottom-0 "
                  >
                    <Auth setShowAuthModal={setShowAuthModal} isModal={true} />
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          </>
        )}
        <HeaderShoppingCart />
      </div>
    </header>
  );
}
