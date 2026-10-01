"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { toPathSlug } from "@/utils/slug";
import HeaderCategory from "./HeaderCategory/HeaderCategory";
import { SITE_NAME } from "@/utils/site";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="home-focus flex h-8 flex-none items-center whitespace-nowrap rounded-full px-3 text-small font-medium text-plum-900/80 transition-colors hover:bg-blush-100 hover:text-plum-900"
    >
      {children}
    </Link>
  );
}

export default function HeaderNav() {
  const { data } = trpc.product.categories.useQuery();
  const mainCategories = data?.[0]?.subCategories ?? [];

  return (
    <nav aria-label="منوی اصلی" className="flex h-11 items-center gap-2">
      <HeaderCategory />
      {/* Wrapping inside a fixed-height row drops links that don't fit instead of overflowing. */}
      <ul className="hidden h-11 min-w-0 flex-1 flex-wrap items-center gap-0.5 overflow-hidden md:flex">
        {mainCategories.map((category) => (
          <li key={category.id}>
            <NavLink
              href={`/category/${category.id}/${toPathSlug(category.title)}`}
            >
              {category.title}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="ms-auto flex flex-none items-center gap-0.5 ps-3">
        <NavLink href="/brands">برندها</NavLink>
        <NavLink href="/mag">مجله {SITE_NAME}</NavLink>
      </div>
    </nav>
  );
}
