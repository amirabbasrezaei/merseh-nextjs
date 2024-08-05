"use client";
import React from "react";
import { Mag_Typography_SVG, MersehSvg, Merseh_typography } from "../../SVGS";
import "react-loading-skeleton/dist/skeleton.css";
import UserAuth from "../../UserAuth";
import Link from "next/link";
import MagHeaderSearch from "./HeaderSearch.mag";
import HeaderCategory from "@/Components/Header/HeaderCategory/HeaderCategory";

export default function Header() {
  return (
    <header className="h-[70px] sm:h-[140px] sm:px-6 w-full sm:gap-10 flex flex-row items-center mb-[-70px] flex-none justify-between">
      <div className="sm:basis-1/12 hidden sm:flex flex-row justify-between gap-5 items-center">
        <UserAuth />
      </div>
      <div className="flex items-center justify-between gap-10 sm:basis-11/12  w-full h-full ">
        <div className="flex flex-row h-full gap-10 items-center md:justify-evenly sm:flex-row-reverse w-full">
          <div className="md:grow ">

          <MagHeaderSearch />
          </div>
          <HeaderCategory />
          <Link aria-label="مرسه" href={"/"} className="h-full flex items-center ">
            <span className="text-[15px] font-[500] text-[#4d4d4d]">
              فروشگاه مرسه
            </span>
          </Link>
        </div>
        <Link
        aria-label="مجله مرسه"
          className="basis-1/12 flex-none flex  flex-row gap-2 items-center justify-center"
          href={"/mag"}
        >
          <Mag_Typography_SVG classname="w-[150px] h-auto fill-[#363636]  " />
          {/* <MersehSvg classname="h-[25px] w-auto" /> */}
        </Link>
      </div>
    </header>
  );
}
