"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Location_Pin, Plus_Svg } from "../SVGS";
import Add_Address from "../Shipping/Address/Add_Address";
import { EmptyState, PanelHeader, SkeletonBlock, buttonClass } from "./ui/ProfileCard";

type AddressCardProps = {
  title: string;
  province: string;
  city: string;
  addressDetails: string;
  receiver: string;
  receiverPhone: string;
  postalCode?: string;
};

function AddressCard({
  title,
  province,
  city,
  addressDetails,
  receiver,
  receiverPhone,
  postalCode,
}: AddressCardProps) {
  return (
    <article className="home-motion flex flex-col gap-4 rounded-tile border border-hairline bg-white p-5 hover:border-mauve-400/60 hover:shadow-raised">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blush-100">
          <Location_Pin classname="h-4 w-4 fill-mauve-700" />
        </span>
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-h3-md text-plum-900">
            {title.trim() || "آدرس بدون عنوان"}
          </h3>
          <p className="text-caption text-lightBlack">
            {province}، {city}
          </p>
        </div>
      </header>

      <p className="text-small leading-7 text-plum-900/80">{addressDetails}</p>

      <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hairline pt-4">
        <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
          <dt className="text-caption text-lightBlack">تحویل‌گیرنده</dt>
          <dd className="truncate text-small text-plum-900">{receiver}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-caption text-lightBlack">شماره تماس</dt>
          <dd dir="ltr" className="text-right text-small text-plum-900">
            {receiverPhone}
          </dd>
        </div>
        {postalCode ? (
          <div className="flex flex-col gap-0.5">
            <dt className="text-caption text-lightBlack">کد پستی</dt>
            <dd dir="ltr" className="text-right text-small text-plum-900">
              {postalCode}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export default function ProfileAddresses() {
  const { data, isLoading } = trpc.shipping.userAddress.useQuery();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);
  const addresses = data?.addresses ?? [];

  const openForm = () => {
    setHasOpenedForm(true);
    setShowAddAddress(true);
  };

  const addButton = (
    <button type="button" onClick={openForm} className={buttonClass("primary")}>
      <Plus_Svg classname="h-3.5 w-3.5 fill-white" />
      افزودن آدرس
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <PanelHeader
        as="h1"
        title="آدرس‌ها"
        description="نشانی‌هایی که برای ارسال سفارش ثبت کرده‌اید."
        action={addresses.length ? addButton : null}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonBlock className="h-56 rounded-tile" />
          <SkeletonBlock className="h-56 rounded-tile" />
        </div>
      ) : addresses.length ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              title={address.title}
              province={address.Province.name}
              city={address.city.name}
              addressDetails={address.addressDetails}
              receiver={`${address.reciverName} ${address.reciverFamilyName}`.trim()}
              receiverPhone={address.reciverPhoneNumber}
              postalCode={address.postalCode}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Location_Pin classname="h-6 w-6 fill-mauve-700" />}
          title="هنوز آدرسی ثبت نکرده‌اید"
          description="با ثبت آدرس، سفارش‌های بعدی را سریع‌تر نهایی کنید."
          action={addButton}
        />
      )}

      {hasOpenedForm ? (
        <Add_Address
          showAddAddress={showAddAddress}
          setShowAddAddress={setShowAddAddress}
        />
      ) : null}
    </div>
  );
}
