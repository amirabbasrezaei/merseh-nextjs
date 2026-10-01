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

const SOURCE_LABEL = {
  CATEGORY: "دسته‌بندی",
  BRAND: "برند",
  MANUAL: "انتخاب دستی",
} as const;

export default function Carousels() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.carousel.list.useQuery();
  const carousels = data?.carousels ?? [];

  const setActive = trpc.carousel.setActive.useMutation({
    onSuccess: () => utils.carousel.list.invalidate(),
    onError: () => toast.error("تغییر وضعیت ناموفق بود"),
  });
  const remove = trpc.carousel.delete.useMutation({
    onSuccess: () => {
      toast.success("کاروسل حذف شد");
      utils.carousel.list.invalidate();
    },
    onError: () => toast.error("حذف کاروسل ناموفق بود"),
  });

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        title="کاروسل‌ها"
        description="هر ردیف با شناسه‌اش به یک کامپوننت HomeCarousel در صفحه وصل می‌شود. جای نمایش را محل همان کامپوننت مشخص می‌کند."
        actions={
          <AdminLinkButton href="/admin/carousel">افزودن کاروسل</AdminLinkButton>
        }
      />
      {isLoading ? (
        <AdminLoading />
      ) : carousels.length ? (
        <AdminList>
          {carousels.map((carousel) => {
            const target =
              carousel.source === "CATEGORY"
                ? carousel.categoryTitle
                : carousel.source === "BRAND"
                  ? carousel.brandName
                  : `${carousel.products.length} محصول`;
            return (
              <AdminListRow key={carousel.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {carousel.logoUrl ? (
                      <Image
                        src={carousel.logoUrl}
                        alt=""
                        fill
                        quality={70}
                        className="object-contain"
                        sizes="48px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/carousel/${carousel.id}`}
                      className="block truncate text-base font-medium text-black1 hover:text-green2"
                    >
                      {carousel.title}
                    </Link>
                    <p className="truncate text-sm text-lightBlack">
                      <span className="font-mono text-black1" dir="ltr">
                        {carousel.slot}
                      </span>
                      {" · "}
                      {SOURCE_LABEL[carousel.source]}
                      {target ? ` · ${target}` : ""}
                    </p>
                  </div>
                  <AdminBadge tone={carousel.isActive ? "success" : "neutral"}>
                    {carousel.isActive ? "فعال" : "غیرفعال"}
                  </AdminBadge>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setActive.mutate({
                        id: carousel.id,
                        isActive: !carousel.isActive,
                      })
                    }
                  >
                    {carousel.isActive ? "غیرفعال" : "فعال"}
                  </AdminButton>
                  <AdminLinkButton
                    href={`/admin/carousel/${carousel.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    ویرایش
                  </AdminLinkButton>
                  <AdminButton
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm(`کاروسل «${carousel.title}» حذف شود؟`)) {
                        remove.mutate({ id: carousel.id });
                      }
                    }}
                  >
                    حذف
                  </AdminButton>
                </div>
              </AdminListRow>
            );
          })}
        </AdminList>
      ) : (
        <AdminEmpty
          title="کاروسلی ثبت نشده است"
          action={
            <AdminLinkButton href="/admin/carousel">افزودن کاروسل</AdminLinkButton>
          }
        />
      )}
    </div>
  );
}
