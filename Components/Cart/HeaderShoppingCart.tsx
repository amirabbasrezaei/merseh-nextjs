"use client";
import React, { useEffect, useState } from "react";

import { Shop_Cart } from "../SVGS";

import Link from "next/link";
import useShoppingCart from "../useShoppingCart";

export default function HeaderShoppingCart() {
  const { items } = useShoppingCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const count = isClient ? items.length : 0;

  return (
    <Link
      aria-label={count ? `سبد خرید، ${count} کالا` : "سبد خرید"}
      href="/cart/checkout"
      className="home-focus group relative hidden h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-blush-100 sm:flex"
    >
      <Shop_Cart classname="h-auto w-[26px] fill-plum-900 transition-colors group-hover:fill-mauve-700" />
      {count ? (
        <span
          aria-hidden
          className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-plum-900 px-1 text-[11px] font-semibold leading-none text-ivory ring-2 ring-white"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
