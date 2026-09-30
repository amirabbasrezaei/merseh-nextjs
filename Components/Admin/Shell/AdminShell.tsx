"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import classNames from "classnames";
import { Merseh_nastaliq } from "@/Components/SVGS";
import AdminNav from "./AdminNav";
import { ADMIN_NAV_ITEMS, getAdminTitle } from "./adminNavConfig";

type Props = {
  children: React.ReactNode;
};

function resolveActiveSlug(pathname: string): string | undefined {
  const segment = pathname.split("/").filter(Boolean)[1];
  if (!segment) return undefined;
  if (segment === "product") return "products";
  if (segment === "article") return "articles";
  if (segment === "category") return "categories";
  return ADMIN_NAV_ITEMS.find((item) => item.slug === segment)?.slug;
}

export default function AdminShell({ children }: Props) {
  const pathname = usePathname() || "/admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSlug = resolveActiveSlug(pathname);
  const title = getAdminTitle(pathname);

  return (
    <div className="admin-root min-h-screen w-full bg-[#F7F8FA] text-base text-black1">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={classNames(
          "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-gray-200 bg-white transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <Merseh_nastaliq classname="h-7 w-auto fill-green2" />
            <span className="text-base font-medium text-gray-600">
              پنل مدیریت
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav
            activeSlug={activeSlug}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pr-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="باز کردن منو"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-black1 sm:text-xl">
              {title}
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-lightBlack hover:text-green2 sm:text-base"
          >
            بازگشت به سایت
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
