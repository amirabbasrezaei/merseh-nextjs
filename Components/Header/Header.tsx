"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import classNames from "classnames";
import "react-loading-skeleton/dist/skeleton.css";
import BrandWordmark from "../Brand/BrandWordmark";
import { MersehSvg_no_color } from "../SVGS";
import HeaderShoppingCart from "../Cart/HeaderShoppingCart";
import UserAuth from "../UserAuth";
import HeaderSearch from "./Search/HeaderSearch";
import HeaderNav from "./HeaderNav";
import useHeaderScroll from "./useHeaderScroll";

const containerClass = "mx-auto w-[90%] max-w-[1400px] sm:w-full sm:px-6";

export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrolled, navHidden } = useHeaderScroll(ref);

  useEffect(() => {
    const header = ref.current;
    const scroller = header?.closest("main");
    if (!header || !scroller) return;

    const sync = () => {
      const hiddenNavHeight = navHidden ? navRef.current?.offsetHeight ?? 0 : 0;
      scroller.style.setProperty(
        "--header-visible",
        `${header.offsetHeight - hiddenNavHeight}px`,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, [navHidden]);

  return (
    <header
      ref={ref}
      dir="rtl"
      className="pointer-events-none sticky top-0 z-30 w-full flex-none"
    >
      <div
        aria-hidden
        className={classNames(
          "absolute inset-x-0 top-0 -z-10 h-14 border-b transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out sm:h-[116px]",
          scrolled
            ? "glass rounded-none border-x-0 border-t-0 border-b-white/60"
            : "border-hairline bg-white",
          navHidden && "sm:-translate-y-11",
        )}
      />

      <div className="pointer-events-auto relative z-20">
        <div
          className={classNames(
            containerClass,
            "flex h-14 items-center gap-4 sm:h-[72px] sm:gap-8",
          )}
        >
          <Link
            href="/"
            aria-label="mehrnil، صفحه اصلی"
            className="home-focus flex flex-none items-center gap-2 rounded-lg"
          >
            <BrandWordmark className="text-[18px] text-plum-900 sm:text-[22px]" />
            <MersehSvg_no_color classname="h-6 w-auto fill-mauve-700 sm:h-7" />
          </Link>

          <div className="flex min-w-0 flex-1 justify-center">
            <HeaderSearch />
          </div>

          <div className="hidden flex-none items-center gap-2 sm:flex">
            <UserAuth />
            <span aria-hidden className="h-6 w-px bg-hairline" />
            <HeaderShoppingCart />
          </div>
        </div>
      </div>

      <div
        ref={navRef}
        className={classNames(
          "relative z-10 hidden transition-[transform,opacity] duration-300 ease-out sm:block",
          navHidden
            ? "pointer-events-none -translate-y-11 opacity-0"
            : "pointer-events-auto",
        )}
      >
        <div className={classNames(containerClass, "relative")}>
          <div
            aria-hidden
            className={classNames(
              "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
              scrolled ? "via-white/80" : "via-hairline",
            )}
          />
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
