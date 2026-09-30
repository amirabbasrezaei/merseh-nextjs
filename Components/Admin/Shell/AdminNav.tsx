"use client";

import Link from "next/link";
import classNames from "classnames";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig";

type Props = {
  activeSlug?: string;
  onNavigate?: () => void;
};

export default function AdminNav({ activeSlug, onNavigate }: Props) {
  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = activeSlug === item.slug;
        return (
          <Link
            key={item.slug}
            href={item.href}
            onClick={onNavigate}
            className={classNames(
              "rounded-lg px-3 py-2.5 text-base transition-colors border-r-2",
              active
                ? "border-green2 bg-green2/5 font-semibold text-green2"
                : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-black1"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
