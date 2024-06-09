"use client";
import React, { useEffect, useState } from "react";
import {
  Chevron_Down,
  Login_icon,
  Magnifier,
  MersehSvg,
  Merseh_typography,
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
import HeaderCategory from "../Header/HeaderCategory/HeaderCategory";
import Link from "next/link";
import HeaderSearch from "../Header/Search/HeaderSearch";
export default function Header() {
  return (
    <header className="h-[70px] sm:h-[116px] sm:px-6 w-full sm:gap-10 flex flex-row items-center mb-[-70px] flex-none justify-between">
      <div className="sm:basis-1/12 hidden sm:flex flex-row justify-between gap-5 items-center">
        <HeaderShoppingCart />
        <UserAuth />
      </div>
      <div className="flex items-center justify-between gap-10 sm:basis-11/12  w-full h-full ">

      <HeaderCategory />
      <HeaderSearch />
        <Link
          className="basis-1/12 flex-none flex  flex-row gap-2 items-center"
          href={"/"}
        >
          <Merseh_typography classname="sm:h-[25px] h-[20px] fill-[#363636]" />
          <MersehSvg classname="h-[20px] w-auto"/>
        </Link>
        

        
      </div>
      
    </header>
  );
}
