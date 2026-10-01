"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Order_Svg } from "../SVGS";
import OrderItem from "./OrderItem";
import { EmptyState, PanelHeader, SkeletonBlock, buttonClass } from "./ui/ProfileCard";

export default function Orders() {
  const { data, isLoading } = trpc.order.orders.useQuery();

  const orders = useMemo(
    () =>
      [...(data?.orders ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data],
  );

  return (
    <div className="flex flex-col gap-5">
      <PanelHeader
        as="h1"
        title="سفارش‌ها"
        description="وضعیت و جزئیات خریدهای شما."
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <SkeletonBlock className="h-64 rounded-tile" />
          <SkeletonBlock className="h-64 rounded-tile" />
        </div>
      ) : orders.length ? (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Order_Svg classname="h-7 w-7 fill-mauve-700" />}
          title="هنوز سفارشی ثبت نکرده‌اید"
          description="محصولات مورد علاقه‌تان را پیدا کنید؛ سفارش‌ها اینجا نمایش داده می‌شوند."
          action={
            <Link href="/" className={buttonClass("primary")}>
              شروع خرید
            </Link>
          }
        />
      )}
    </div>
  );
}
