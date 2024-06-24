"use client";
import React from "react";
import { MersehSvg, Merseh_typography } from "../SVGS";
import "react-loading-skeleton/dist/skeleton.css";
import HeaderShoppingCart from "../Cart/HeaderShoppingCart";
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
          <MersehSvg classname="h-[20px] w-auto" />
        </Link>
      </div>
    </header>
  );
}
