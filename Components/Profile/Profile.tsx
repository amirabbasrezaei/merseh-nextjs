"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Order_Svg, User_Svg } from "../SVGS";
import classNames from "classnames";
import ProfileInfo from "./ProfileInfo";
import Orders from "./Orders";

export default function Profile() {
  const path = usePathname();
  const router = useRouter();
  const [] = useState();
  return (
    <section className="w-full flex flex-col sm:flex-row px-6 h-full gap-6">
      <div className="sm:basis-1/6 gap-5 grid grid-cols-2 sm:flex flex-col items-center   h-[100px]">
        <div
          onClick={() => router.push("/profile")}
          className={classNames(
            "h-[30px] w-full cursor-pointer flex flex-row items-center justify-center gap-1 py-7 rounded-[10px]",
            path === "/profile" ? "bg-gray-50" : "bg-white"
          )}
        >
          <User_Svg
            classname={classNames(
              " w-8 h-auto",
              path === "/profile" ? "fill-green1" : "fill-black1"
            )}
          />
          <span
            className={classNames(
              path === "/profile" ? "text-black1" : "text-lightBlack"
            )}
          >
            اطلاعات حساب
          </span>
        </div>
        <div
          onClick={() => router.push("/profile/orders")}
          className={classNames(
            "h-[30px] cursor-pointer w-full flex flex-row items-center justify-center gap-1 py-7 rounded-[10px]",
            path === "/profile/orders" ? "bg-gray-50" : "bg-white"
          )}
        >
          <Order_Svg
            classname={classNames(
              " w-8 h-auto",
              path === "/profile/orders" ? "fill-green1" : "fill-lightBlack"
            )}
          />
          <span
            className={classNames(
              path === "/profile/orders" ? "text-black1" : "text-lightBlack"
            )}
          >
            سفارش ها
          </span>
        </div>
      </div>
      <div className="h-full w-full sm:basis-5/6">
        {path === "/profile" ? (
          <ProfileInfo />
        ) : path === "/profile/orders" ? (
          <Orders />
        ) : null}
      </div>
    </section>
  );
}
