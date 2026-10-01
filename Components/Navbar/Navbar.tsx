"use client";

import { type ComponentType, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { Category_Svg, Home_Svg, Profile_Svg, Shop_Cart } from "../SVGS";
import GlassThumb from "../ui/GlassThumb";
import useShoppingCart from "../useShoppingCart";

const CART_HREF = "/cart/checkout";

/** The SVGs mix filled and outlined artwork, so the tint targets either fill or stroke. */
const PAINT = {
  fill: { active: "fill-mauve-700", idle: "fill-plum-900/80" },
  stroke: { active: "stroke-mauve-700", idle: "stroke-plum-900/80" },
} as const;

type Tab = {
  href: string;
  label: string;
  Icon: ComponentType<{ classname?: string }>;
  iconClass: string;
  paint: keyof typeof PAINT;
  isActive: (path: string) => boolean;
};

const TABS: Tab[] = [
  {
    href: "/",
    label: "خانه",
    Icon: Home_Svg,
    iconClass: "-my-[3px] h-[30px]",
    paint: "fill",
    isActive: (path) => path === "/" || path.includes("product"),
  },
  {
    href: "/mcategory",
    label: "دسته‌بندی",
    Icon: Category_Svg,
    iconClass: "h-[21px]",
    paint: "stroke",
    isActive: (path) => path === "/mcategory" || path.startsWith("/category/"),
  },
  {
    href: CART_HREF,
    label: "سبد خرید",
    Icon: Shop_Cart,
    iconClass: "h-6",
    paint: "fill",
    isActive: (path) => path === CART_HREF,
  },
  {
    href: "/profile",
    label: "حساب کاربری",
    Icon: Profile_Svg,
    iconClass: "h-[22px]",
    paint: "stroke",
    isActive: (path) => path.split("/")[1] === "profile",
  },
];

export default function Navbar() {
  const path = usePathname();
  const { items } = useShoppingCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const cartCount = isClient ? items.length : 0;

  return (
    <nav
      aria-label="منوی پایین"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-20 sm:hidden"
    >
      <ul className="glass flex h-16 items-stretch rounded-full p-1.5">
        {TABS.map(({ href, label, Icon, iconClass, paint, isActive }) => {
          const active = isActive(path);
          const showCartDot = href === CART_HREF && cartCount > 0 && !active;

          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={showCartDot ? `${label}، ${cartCount} کالا` : undefined}
                className={classNames(
                  "home-focus relative isolate flex flex-1 flex-col items-center justify-center gap-1 rounded-full text-[10px] font-medium transition-colors",
                  active ? "text-mauve-700" : "text-plum-900/80",
                )}
              >
                {active ? (
                  <GlassThumb
                    layoutId="navbar-active-tab"
                    className="bg-blush-100/70 [background-image:none]"
                  />
                ) : null}
                <Icon
                  classname={classNames(
                    "w-auto transition-colors",
                    iconClass,
                    PAINT[paint][active ? "active" : "idle"],
                  )}
                />
                {label}
                {showCartDot ? (
                  <span
                    aria-hidden
                    className="absolute end-[calc(50%-17px)] top-2 h-2 w-2 rounded-full bg-mauve-600 ring-2 ring-white"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
