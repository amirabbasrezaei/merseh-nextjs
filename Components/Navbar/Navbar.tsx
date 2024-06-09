import React from "react";
import {
  Category_Svg,
  Home_Svg,
  MersehSvg,
  Profile_Light_Svg,
  Profile_Svg,
  Shop_Cart,
} from "../SVGS";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import classNames from "classnames";
import { useRecoilState } from "recoil";
import { shopingCartStateAtom } from "../Cart/HeaderShoppingCart";

export default function Navbar() {
  const path = usePathname();

  const [shoppngCart] = useRecoilState(shopingCartStateAtom);
  return (
    <div
      style={{ boxShadow: "rgb(237 237 237) 0px 0px 14px" }}
      className="fixed w-full   bottom-0 z-10 right-0 left-0  bg-white sm:hidden sm:h-0 h-[60px] flex flex-row items-center"
    >
      <Link
        href={"/"}
        className="basis-1/4 w-full h-fit  flex flex-col items-center justify-center"
      >
        <Home_Svg
          classname={classNames(
            "h-[35px] w-auto flex items-center my-[-5px] justify-center",
            path === "/" ||
              path.includes("products") ||
              path.includes("product")
              ? "fill-green1"
              : "fill-[#363636]"
          )}
        />
        <span
          className={classNames(
            path === "/" ||
              path.includes("products") ||
              path.includes("product")
              ? " text-green1"
              : " text-[#363636]",
            "text-[10px]"
          )}
        >
          خانه
        </span>
      </Link>
      <Link
        href={"/mcategory"}
        className="basis-1/4 w-full flex flex-col items-center justify-center"
      >
        <Category_Svg
          classname={classNames(
            "h-[25px] w-auto ",
            path === "/mcategory" ? "stroke-green1" : "stroke-[#363636]"
          )}
        />
        <span
          className={classNames(
            path === "/mcategory" ? " text-green1" : " text-[#363636]",
            "text-[10px]"
          )}
        >
          دسته بندی‌
        </span>
      </Link>
      <Link
        href={"/cart/checkout"}
        className="basis-1/4 w-full flex flex-col  items-center justify-center relative"
      >
        <Shop_Cart
          classname={classNames(
            "h-[28px] w-auto ",
            path === "/cart/checkout" ? "fill-green1" : "fill-[#363636]"
          )}
        />
        {shoppngCart?.orderitems?.length && path !== "/cart/checkout" ? (
          <div className=" absolute top-[-7px] right-[29px] ">
            <svg className="fill-green1 w-4 h-4 flex items justify-center animate-pulse">
              <circle r="3" cx="10" cy="10" className="" />
            </svg>
          </div>
        ) : null}
        <span
          className={classNames(
            path === "/cart/checkout" ? " text-green1" : " text-[#363636]",
            "text-[10px]"
          )}
        >
          سبد خرید
        </span>
      </Link>
      <Link
        href={"/profile"}
        className="basis-1/4 w-full flex flex-col items-center justify-center"
      >
        <Profile_Svg
          classname={classNames(
            "h-[26px] w-auto ",
            path === "/profile" ? "stroke-green1" : "stroke-[#363636]"
          )}
        />
        <span
          className={classNames(
            path === "/profile" ? " text-green1" : " text-[#363636]",
            "text-[10px]"
          )}
        >
          حساب کاربری
        </span>
      </Link>
    </div>
  );
}
