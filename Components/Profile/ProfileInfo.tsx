"use client";

import React, { type ReactNode, useState } from "react";
import Link from "next/link";
import classNames from "classnames";
import { trpc } from "@/utils/trpc";
import { Eyebrow } from "../Home/ui/SectionHeader";
import { useResetAccountQueries } from "../Auth/useResetAccountQueries";
import { Edit_Svg, Location_Pin, Logout_SVG, Order_Svg } from "../SVGS";
import EditProfileForm from "./EditProfileForm";
import type { ProfileUser } from "./types";
import { PanelHeader, ProfileCard, SkeletonBlock, buttonClass } from "./ui/ProfileCard";

type Props = {
  user: ProfileUser;
};

const memberSinceFormat = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
});

function initialsOf(user: ProfileUser) {
  return [user.name, user.familyName]
    .map((part) => part?.trim().charAt(0))
    .filter(Boolean)
    .join("\u200c");
}

function StatTile({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="home-focus home-motion flex items-center gap-3.5 rounded-card border border-hairline bg-white p-4 hover:-translate-y-0.5 hover:border-mauve-400 hover:shadow-raised"
    >
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blush-100 text-mauve-700">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-caption text-lightBlack">{label}</span>
        <span className="truncate text-h3-md font-semibold text-plum-900">{value}</span>
      </span>
    </Link>
  );
}

function DetailRow({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value?: string | null;
  ltr?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-card bg-ivory px-4 py-3.5">
      <dt className="text-caption text-lightBlack">{label}</dt>
      <dd
        dir={ltr && value ? "ltr" : undefined}
        className={classNames(
          "truncate text-body",
          ltr && "text-right",
          value ? "text-plum-900" : "text-lightBlack/70",
        )}
      >
        {value || "ثبت نشده"}
      </dd>
    </div>
  );
}

export default function ProfileInfo({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const resetAccountQueries = useResetAccountQueries();
  const { data: ordersData, isLoading: isLoadingOrders } =
    trpc.order.orders.useQuery();
  const { data: addressesData, isLoading: isLoadingAddresses } =
    trpc.shipping.userAddress.useQuery();
  const logout = trpc.user.logout.useMutation({
    onSuccess: () => resetAccountQueries(),
  });

  const fullName = [user.name, user.familyName].filter(Boolean).join(" ");
  const memberSince = user.createdAt
    ? memberSinceFormat.format(new Date(user.createdAt))
    : null;
  const countPlaceholder = <SkeletonBlock className="mt-1 h-5 w-10 rounded-md" />;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-panel border border-hairline bg-gradient-to-l from-blush-100 via-ivory to-sand p-6 sm:p-8">
        <span
          aria-hidden
          className="arch pointer-events-none absolute -bottom-24 -left-8 h-64 w-48 bg-blush-200/50"
        />
        <span
          aria-hidden
          className="arch pointer-events-none absolute -bottom-32 left-28 hidden h-56 w-40 bg-white/60 sm:block"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-mauve-700 text-[26px] font-semibold text-white shadow-float ring-4 ring-white">
            {initialsOf(user)}
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <Eyebrow>حساب کاربری</Eyebrow>
            <h1 className="truncate text-display text-plum-900">{fullName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span dir="ltr" className="text-small text-plum-900/70">
                {user.phoneNumber}
              </span>
              {memberSince ? (
                <span className="rounded-full border border-hairline bg-white/70 px-2.5 py-1 text-caption text-plum-900/70">
                  عضو از {memberSince}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          icon={<Order_Svg classname="h-5 w-5 fill-current" />}
          label="سفارش‌ها"
          href="/profile/orders"
          value={isLoadingOrders ? countPlaceholder : ordersData?.orders.length ?? 0}
        />
        <StatTile
          icon={<Location_Pin classname="h-4 w-4 fill-current" />}
          label="آدرس‌های ذخیره‌شده"
          href="/profile/addresses"
          value={
            isLoadingAddresses
              ? countPlaceholder
              : addressesData?.addresses?.length ?? 0
          }
        />
      </div>

      <ProfileCard className="flex flex-col gap-6">
        <PanelHeader
          title="مشخصات فردی"
          description={
            isEditing
              ? "نام و ایمیل خود را ویرایش کنید."
              : "اطلاعاتی که برای ارسال سفارش و ارتباط با شما استفاده می‌شود."
          }
          action={
            isEditing ? null : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={buttonClass("secondary", "h-10 px-4")}
              >
                <Edit_Svg classname="h-5 w-auto fill-mauve-700" />
                ویرایش اطلاعات
              </button>
            )
          }
        />

        {isEditing ? (
          <EditProfileForm user={user} onDone={() => setIsEditing(false)} />
        ) : (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow label="نام" value={user.name} />
            <DetailRow label="نام خانوادگی" value={user.familyName} />
            <DetailRow label="شماره موبایل" value={user.phoneNumber} ltr />
            <DetailRow label="ایمیل" value={user.email} ltr />
          </dl>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-hairline pt-5">
          <p className="text-caption text-lightBlack">
            برای خروج از این دستگاه از حساب خارج شوید.
          </p>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className={buttonClass("quiet", "h-10 px-4")}
          >
            <Logout_SVG classname="h-4 w-4" />
            {logout.isPending ? "در حال خروج..." : "خروج از حساب"}
          </button>
        </div>
      </ProfileCard>
    </div>
  );
}
