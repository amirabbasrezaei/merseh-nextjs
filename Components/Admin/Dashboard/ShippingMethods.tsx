"use client";

import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import splitNumber from "@/Components/utils/splitNumber";
import { Truck_Courier_SVG } from "@/Components/SVGS";
import AdminBadge from "../ui/AdminBadge";
import AdminButton from "../ui/AdminButton";
import AdminCheckbox from "../ui/AdminCheckbox";
import AdminEmpty from "../ui/AdminEmpty";
import AdminInput from "../ui/AdminInput";
import { AdminList, AdminListRow } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminPageHeader from "../ui/AdminPageHeader";

type Carrier =
  inferRouterOutputs<AppRouter>["shipping"]["adminCarriers"]["carriers"][number];

function CarrierRow({ carrier }: { carrier: Carrier }) {
  const utils = trpc.useUtils();
  const [price, setPrice] = useState(String(carrier.price));
  const [isActive, setIsActive] = useState(carrier.isActive);
  const update = trpc.shipping.updateCarrier.useMutation({
    onSuccess: () => {
      toast.success(`${carrier.name} ذخیره شد`);
      utils.shipping.adminCarriers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const priceValue = Number(price);
  const isDirty = priceValue !== carrier.price || isActive !== carrier.isActive;

  return (
    <AdminListRow className="sm:items-end">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          {carrier.imageUrl ? (
            <Image
              src={carrier.imageUrl}
              alt={carrier.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <Truck_Courier_SVG classname="h-6 w-6 fill-gray-400" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-base font-medium text-black1">
            {carrier.name}
          </span>
          <AdminBadge tone={carrier.isActive ? "success" : "neutral"}>
            {carrier.isActive
              ? `فعال · ${splitNumber(carrier.price)} تومان`
              : "غیرفعال"}
          </AdminBadge>
        </div>
      </div>

      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate({ id: carrier.id, price: priceValue, isActive });
        }}
      >
        <AdminInput
          label="هزینه ارسال (تومان)"
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          dir="ltr"
          value={price}
          onChange={(event) => setPrice(event.currentTarget.value)}
          containerClassName="!w-44"
        />
        <AdminCheckbox
          label="نمایش در سبد خرید"
          checked={isActive}
          onChange={(event) => setIsActive(event.currentTarget.checked)}
          containerClassName="pb-2.5"
        />
        <AdminButton
          type="submit"
          size="sm"
          className="mb-1"
          disabled={!isDirty || update.isPending || Number.isNaN(priceValue)}
        >
          {update.isPending ? "در حال ذخیره…" : "ذخیره"}
        </AdminButton>
      </form>
    </AdminListRow>
  );
}

export default function ShippingMethods() {
  const { data, isLoading } = trpc.shipping.adminCarriers.useQuery();

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        title="روش‌های ارسال"
        description="هزینه ثابت هر روش ارسال را تعیین کنید. فقط روش‌های فعال در سبد خرید نمایش داده می‌شوند."
      />
      {isLoading ? (
        <AdminLoading />
      ) : data?.carriers.length ? (
        <AdminList>
          {data.carriers.map((carrier) => (
            <CarrierRow
              key={`${carrier.id}-${carrier.price}-${carrier.isActive}`}
              carrier={carrier}
            />
          ))}
        </AdminList>
      ) : (
        <AdminEmpty
          title="روش ارسالی پیدا نشد"
          description="مایگریشن پایگاه داده را اجرا کنید تا پست پیشتاز، تیپاکس و چاپار ساخته شوند."
        />
      )}
    </div>
  );
}
