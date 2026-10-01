"use client";

import { trpc } from "@/utils/trpc";
import Image from "next/image";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import AdminPanel from "../ui/AdminPanel";
import AdminInput from "../ui/AdminInput";
import AdminButton from "../ui/AdminButton";
import AdminLoading from "../ui/AdminLoading";
import AdminEmpty from "../ui/AdminEmpty";
import AdminBadge from "../ui/AdminBadge";

type Placement = "HERO" | "SIDE";

type BannerItem = {
  id: string;
  placement: Placement;
  title: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  imageFileId: string;
  imageUrl: string;
};

function BannerPanel({
  title,
  sizeHint,
  placement,
  banners,
  onRefresh,
}: {
  title: string;
  sizeHint: string;
  placement: Placement;
  banners: BannerItem[];
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [href, setHref] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [pendingImage, setPendingImage] = useState<{
    base64: string;
    name: string;
  } | null>(null);

  const createMutation = trpc.banner.create.useMutation({
    onSuccess: () => {
      toast.success("بنر افزوده شد");
      setHref("");
      setBannerTitle("");
      setPendingImage(null);
      if (fileRef.current) fileRef.current.value = "";
      onRefresh();
    },
    onError: () => toast.error("افزودن بنر ناموفق بود"),
  });
  const updateMutation = trpc.banner.update.useMutation({
    onSuccess: () => {
      toast.success("بنر به‌روز شد");
      onRefresh();
    },
  });
  const setActiveMutation = trpc.banner.setActive.useMutation({
    onSuccess: onRefresh,
  });
  const deleteMutation = trpc.banner.delete.useMutation({
    onSuccess: () => {
      toast.success("بنر حذف شد");
      onRefresh();
    },
  });
  const reorderMutation = trpc.banner.reorder.useMutation({
    onSuccess: onRefresh,
  });

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= banners.length) return;
    const orderedIds = banners.map((b) => b.id);
    const tmp = orderedIds[index];
    orderedIds[index] = orderedIds[next];
    orderedIds[next] = tmp;
    reorderMutation.mutate({ placement, orderedIds });
  };

  return (
    <AdminPanel title={title}>
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-4">
        <span className="text-sm font-medium text-gray-700">
          افزودن بنر جدید
        </span>
        <span className="text-xs text-gray-500">{sizeHint}</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="text-sm text-gray-600 file:ml-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 file:shadow-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => {
              setPendingImage({
                base64: reader.result as string,
                name: file.name,
              });
            };
            reader.readAsDataURL(file);
          }}
        />
        <AdminInput
          value={bannerTitle}
          onChange={(e) => setBannerTitle(e.target.value)}
          placeholder="عنوان (اختیاری)"
        />
        <AdminInput
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="لینک (اختیاری)"
          dir="ltr"
        />
        <AdminButton
          disabled={!pendingImage || createMutation.isPending}
          onClick={() => {
            if (!pendingImage) return;
            createMutation.mutate({
              placement,
              title: bannerTitle || undefined,
              href: href || undefined,
              image: pendingImage,
            });
          }}
          className="self-start"
        >
          افزودن
        </AdminButton>
      </div>

      <div className="flex flex-col gap-3">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-3 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={banner.imageUrl}
                alt={banner.title || "banner"}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <AdminBadge tone={banner.isActive ? "success" : "neutral"}>
                  {banner.isActive ? "فعال" : "غیرفعال"}
                </AdminBadge>
              </div>
              <AdminInput
                defaultValue={banner.title || ""}
                placeholder="عنوان"
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value !== (banner.title || "")) {
                    updateMutation.mutate({
                      id: banner.id,
                      title: value || null,
                    });
                  }
                }}
              />
              <AdminInput
                defaultValue={banner.href || ""}
                placeholder="لینک"
                dir="ltr"
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value !== (banner.href || "")) {
                    updateMutation.mutate({
                      id: banner.id,
                      href: value || null,
                    });
                  }
                }}
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green2 focus:ring-green2"
                  checked={banner.isActive}
                  onChange={(e) =>
                    setActiveMutation.mutate({
                      id: banner.id,
                      isActive: e.target.checked,
                    })
                  }
                />
                فعال
              </label>
            </div>
            <div className="flex flex-row gap-1 sm:flex-col">
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => move(index, -1)}
              >
                بالا
              </AdminButton>
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => move(index, 1)}
              >
                پایین
              </AdminButton>
              <AdminButton
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm("بنر حذف شود؟")) {
                    deleteMutation.mutate({ id: banner.id });
                  }
                }}
              >
                حذف
              </AdminButton>
            </div>
          </div>
        ))}
        {!banners.length ? (
          <AdminEmpty title="هنوز بنری ثبت نشده است" className="!py-8" />
        ) : null}
      </div>
    </AdminPanel>
  );
}

export default function BannersAdmin() {
  const { data, isLoading, refetch } = trpc.banner.list.useQuery();

  if (isLoading) {
    return <AdminLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <BannerPanel
        title="کاروسل اصلی (Hero)"
        sizeHint="اندازه پیشنهادی: ۱۶۸۰ × ۹۴۵ پیکسل (۱۶:۹). در موبایل کمی از بالا و پایین بریده می‌شود."
        placement="HERO"
        banners={(data?.hero || []) as BannerItem[]}
        onRefresh={() => refetch()}
      />
      <BannerPanel
        title="بنرهای کناری (Side)"
        sizeHint="اندازه پیشنهادی: ۱۰۲۰ × ۹۴۵ پیکسل (تقریباً مربع). فقط در دسکتاپ نمایش داده می‌شود."
        placement="SIDE"
        banners={(data?.side || []) as BannerItem[]}
        onRefresh={() => refetch()}
      />
    </div>
  );
}
