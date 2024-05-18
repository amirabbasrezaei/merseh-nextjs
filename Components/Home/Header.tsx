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
import UserAuth from "../UserAuth";
export default function Header() {
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
        <UserAuth />
        <HeaderShoppingCart />
      </div>
    </header>
  );
}
