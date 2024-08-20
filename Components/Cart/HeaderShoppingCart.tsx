"use client";
import React, { useEffect, useState } from "react";

import { Shop_Cart } from "../SVGS";

import Link from "next/link";
import useShoppingCart from "../useShoppingCart";


export default function HeaderShoppingCart() {
  const { items } = useShoppingCart();
  const [isClient, setisClient] = useState(false);

  useEffect(() => {
    setisClient(true);
  }, [isClient]);
  return (
    <div className="relative hidden sm:flex">
      <Link
        aria-label="shoppingCart"
        href={"/cart/checkout"}
        className=" hover:bg-hover1 hover:fill-green1 cursor-pointer rounded-[15px] relative"
      >
        {items.length && isClient ? (
          <div className=" absolute top-[6px] right-[7px] flex    items-center justify-center">
            <svg className="fill-green1 w-4 h-4 flex items justify-center animate-pulse">
              <circle r="3" cx="10" cy="10" />
            </svg>
          </div>
        ) : null}

        <Shop_Cart classname="hover:fill-inherit fill-[#363636] w-[53px] p-3" />
      </Link>
    </div>
  );
}
