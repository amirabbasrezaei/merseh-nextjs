"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import classNames from "classnames";
import GlassThumb from "../ui/GlassThumb";
import { Location_Pin, Order_Svg, Profile_Svg } from "../SVGS";
import { PROFILE_SECTIONS, type ProfileSectionId } from "./sections";

/** The SVGs mix filled and outlined artwork, so the tint targets either fill or stroke. */
const PAINT = {
  fill: { active: "fill-mauve-700", idle: "fill-plum-900/70" },
  stroke: { active: "stroke-mauve-700", idle: "stroke-plum-900/70" },
} as const;

const ICONS: Record<
  ProfileSectionId,
  {
    Icon: ComponentType<{ classname?: string }>;
    paint: keyof typeof PAINT;
    iconClass: string;
  }
> = {
  account: { Icon: Profile_Svg, paint: "stroke", iconClass: "h-[18px] w-[18px]" },
  addresses: { Icon: Location_Pin, paint: "fill", iconClass: "h-4 w-4" },
  orders: { Icon: Order_Svg, paint: "fill", iconClass: "h-[18px] w-[18px]" },
};

export default function ProfileNav({ active }: { active: ProfileSectionId }) {
  return (
    <nav
      aria-label="بخش‌های حساب کاربری"
      className="w-full flex-none md:sticky md:top-28 md:w-64"
    >
      <ul className="flex gap-1 rounded-full bg-sand p-1 md:flex-col md:gap-1.5 md:rounded-tile md:border md:border-hairline md:bg-white md:p-2">
        {PROFILE_SECTIONS.map(({ id, href, label, description }) => {
          const isActive = id === active;
          const { Icon, paint, iconClass } = ICONS[id];

          return (
            <li key={id} className="flex flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={classNames(
                  "home-focus relative isolate flex flex-1 items-center justify-center gap-2 rounded-full px-2 py-2.5 text-[13px] font-medium transition-colors md:justify-start md:gap-3 md:rounded-2xl md:px-3 md:py-3 md:text-small",
                  isActive
                    ? "text-mauve-700"
                    : "text-plum-900/80 hover:text-plum-900 md:hover:bg-ivory",
                )}
              >
                {isActive ? (
                  <GlassThumb
                    layoutId="profile-nav-active"
                    className="bg-white [background-image:none] md:rounded-2xl md:bg-blush-100"
                  />
                ) : null}
                <span
                  className={classNames(
                    "hidden h-10 w-10 flex-none items-center justify-center rounded-full transition-colors md:flex",
                    isActive ? "bg-white" : "bg-sand",
                  )}
                >
                  <Icon
                    classname={classNames(iconClass, PAINT[paint][isActive ? "active" : "idle"])}
                  />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{label}</span>
                  <span className="hidden text-caption font-normal text-lightBlack md:block">
                    {description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
