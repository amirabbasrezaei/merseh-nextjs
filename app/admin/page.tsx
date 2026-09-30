import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/Components/Admin/Shell/adminNavConfig";
import React from "react";

export default function page() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-6 rounded-xl border border-gray-200 bg-white p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-black1">
          به پنل مدیریت خوش آمدید
        </h2>
        <p className="text-base leading-7 text-lightBlack">
          یک بخش را از منوی کناری انتخاب کنید یا از میانبرهای زیر شروع کنید.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link
            key={item.slug}
            href={item.href}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-gray-700 transition-colors hover:border-green2/40 hover:text-green2"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
