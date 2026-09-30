"use client";

import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import AdminBadge from "../ui/AdminBadge";
import AdminButton from "../ui/AdminButton";
import AdminEmpty from "../ui/AdminEmpty";
import AdminLinkButton from "../ui/AdminLinkButton";
import { AdminList, AdminListRow } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminPageHeader from "../ui/AdminPageHeader";

export default function Brands() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.brand.list.useQuery();
  const setActive = trpc.brand.setActive.useMutation({
    onSuccess: () => utils.brand.list.invalidate(),
    onError: () => toast.error("تغییر وضعیت ناموفق بود"),
  });
  const remove = trpc.brand.delete.useMutation({
    onSuccess: () => {
      toast.success("برند حذف شد");
      utils.brand.list.invalidate();
    },
    onError: () => toast.error("حذف برند ناموفق بود"),
  });

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        title="برندها"
        description="نام، لوگو و توضیحات برندهایی که روی محصول‌ها نمایش داده می‌شوند."
        actions={<AdminLinkButton href="/admin/brand">افزودن برند</AdminLinkButton>}
      />
      {isLoading ? (
        <AdminLoading />
      ) : data?.brands.length ? (
        <AdminList>
          {data.brands.map((brand) => (
            <AdminListRow key={brand.id}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      fill
                      quality={70}
                      className="object-contain"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/admin/brand/${brand.id}`}
                    className="block truncate text-base font-medium text-black1 hover:text-green2"
                  >
                    {brand.name}
                  </Link>
                  <p className="text-sm text-lightBlack">
                    {brand.productCount} محصول
                  </p>
                </div>
                <AdminBadge tone={brand.isActive ? "success" : "neutral"}>
                  {brand.isActive ? "فعال" : "غیرفعال"}
                </AdminBadge>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setActive.mutate({ id: brand.id, isActive: !brand.isActive })
                  }
                >
                  {brand.isActive ? "غیرفعال کردن" : "فعال کردن"}
                </AdminButton>
                <AdminLinkButton
                  href={`/admin/brand/${brand.id}`}
                  variant="secondary"
                  size="sm"
                >
                  ویرایش
                </AdminLinkButton>
                <AdminButton
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm(`برند «${brand.name}» حذف شود؟`)) {
                      remove.mutate({ id: brand.id });
                    }
                  }}
                >
                  حذف
                </AdminButton>
              </div>
            </AdminListRow>
          ))}
        </AdminList>
      ) : (
        <AdminEmpty
          title="برندی ثبت نشده است"
          description="اولین برند را بسازید تا بتوانید آن را به محصول‌ها و کاروسل‌ها وصل کنید."
          action={<AdminLinkButton href="/admin/brand">افزودن برند</AdminLinkButton>}
        />
      )}
    </div>
  );
}
