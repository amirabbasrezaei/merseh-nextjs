"use client";

import React, { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import splitNumber from "../utils/splitNumber";
import { Chevron_Down, Image_Svg } from "../SVGS";
import type { ProfileOrder } from "./types";
import { buttonClass } from "./ui/ProfileCard";

type OrderStatus = ProfileOrder["status"];

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  ACTIVE: { label: "در انتظار پرداخت", className: "bg-champagne/25 text-plum-900" },
  PAYED: { label: "پرداخت شده", className: "bg-tint text-green2" },
  DELIVERING: { label: "در حال ارسال", className: "bg-blush-100 text-mauve-700" },
  DELIVERED: { label: "تحویل شده", className: "bg-sand text-plum-900/70" },
};

const TRACK_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PAYED", label: "پرداخت" },
  { status: "DELIVERING", label: "ارسال" },
  { status: "DELIVERED", label: "تحویل" },
];

const orderDateFormat = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function OrderTrack({ status }: { status: OrderStatus }) {
  const reached = TRACK_STEPS.findIndex((step) => step.status === status);

  return (
    <ol className="grid grid-cols-3 gap-2">
      {TRACK_STEPS.map((step, index) => (
        <li key={step.status} className="flex flex-col gap-2">
          <span
            className={classNames(
              "h-1.5 rounded-full",
              index <= reached ? "bg-mauve-600" : "bg-hairline",
            )}
          />
          <span
            className={classNames(
              "text-caption",
              index <= reached ? "font-medium text-plum-900" : "text-lightBlack",
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ShippingRow({
  label,
  value,
  ltr = false,
  wide = false,
}: {
  label: string;
  value?: string | null;
  ltr?: boolean;
  wide?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={classNames("flex flex-col gap-0.5", wide && "sm:col-span-2")}>
      <dt className="text-caption text-lightBlack">{label}</dt>
      <dd
        dir={ltr ? "ltr" : undefined}
        className={classNames("text-small text-plum-900", ltr && "text-right")}
      >
        {value}
      </dd>
    </div>
  );
}

export default function OrderItem({ order }: { order: ProfileOrder }) {
  const [showDetails, setShowDetails] = useState(false);
  const reduceMotion = useReducedMotion();
  const detailsId = useId();
  const status = STATUS[order.status];
  const address = order.Address;
  const hasAddress = Boolean(address.Province?.name);
  const receiver = [address.reciverName, address.reciverFamilyName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const itemCount = order.ProductForOrder.reduce(
    (total, item) => total + item.numberOfproduct,
    0,
  );

  return (
    <article className="overflow-hidden rounded-tile border border-hairline bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-h3-md text-plum-900">سفارش {order.id}</h2>
          <p className="text-caption text-lightBlack">
            {orderDateFormat.format(new Date(order.createdAt))}
            {" · "}
            {itemCount} کالا
          </p>
        </div>
        <span
          className={classNames(
            "rounded-full px-3 py-1 text-caption font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
      </header>

      <ul className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-5">
        {order.ProductForOrder.map((item, index) => {
          const variation = item.ProductVariationValue?.name;
          const name = variation ? `${item.Product.name} - ${variation}` : item.Product.name;

          return (
            <li key={index} className="w-28 flex-none">
              <Link
                href={`/product/${item.Product.id}`}
                className="home-focus group flex flex-col gap-2"
              >
                <span className="relative flex aspect-square items-center justify-center overflow-hidden rounded-card border border-hairline bg-ivory">
                  {item.Product.imageUrl ? (
                    <Image
                      src={item.Product.imageUrl}
                      alt={name}
                      width={112}
                      height={112}
                      className="home-motion h-full w-full object-cover group-hover:scale-105"
                    />
                  ) : (
                    <Image_Svg classname="h-8 w-8 fill-hairline" />
                  )}
                  {item.numberOfproduct > 1 ? (
                    <span className="absolute end-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-plum-900/85 px-1.5 text-caption text-white">
                      {item.numberOfproduct}×
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-2 text-caption text-plum-900 group-hover:text-mauve-700">
                  {name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-ivory/60 px-5 py-3">
        <p className="text-small text-lightBlack">
          {order.finalPrice ? (
            <>
              مبلغ کل:{" "}
              <span className="font-semibold text-plum-900">
                {splitNumber(order.finalPrice)}
              </span>{" "}
              تومان
            </>
          ) : (
            "مبلغ پس از تکمیل خرید محاسبه می‌شود"
          )}
        </p>

        {order.status === "ACTIVE" ? (
          <Link href="/cart/checkout" className={buttonClass("primary", "h-9 px-4")}>
            تکمیل خرید
          </Link>
        ) : hasAddress ? (
          <button
            type="button"
            aria-expanded={showDetails}
            aria-controls={detailsId}
            onClick={() => setShowDetails((open) => !open)}
            className={buttonClass("quiet", "h-9 px-3")}
          >
            {showDetails ? "بستن جزئیات" : "جزئیات ارسال"}
            <Chevron_Down
              classname={classNames(
                "h-2.5 w-2.5 fill-current transition-transform duration-300",
                showDetails && "rotate-180",
              )}
            />
          </button>
        ) : null}
      </footer>

      <AnimatePresence initial={false}>
        {showDetails ? (
          <motion.div
            id={detailsId}
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.35 }
            }
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-5 border-t border-hairline px-5 py-5">
              <OrderTrack status={order.status} />
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <ShippingRow label="عنوان آدرس" value={address.title} />
                <ShippingRow
                  label="استان و شهر"
                  value={[address.Province?.name, address.city?.name]
                    .filter(Boolean)
                    .join("، ")}
                />
                <ShippingRow label="نشانی" value={address.addressDetails} wide />
                <ShippingRow label="تحویل‌گیرنده" value={receiver} />
                <ShippingRow label="شماره تماس" value={address.reciverPhoneNumber} ltr />
                <ShippingRow label="کد پستی" value={address.postalCode} ltr />
              </dl>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
