"use client";

import classNames from "classnames";
import Link from "next/link";
import { useId, useState } from "react";
import toast from "react-hot-toast";
import { trpc } from "@/utils/trpc";
import CheckoutShell from "../Checkout/CheckoutShell";
import CouponForm from "../Checkout/CouponForm";
import { readCheckoutError } from "../Checkout/format";
import { TruckIcon } from "../Checkout/icons";
import ItemsPreview from "../Checkout/ItemsPreview";
import OrderSummary from "../Checkout/OrderSummary";
import { countItems } from "../Checkout/pricing";
import ShippingMethodCard from "../Checkout/ShippingMethodCard";
import type { CheckoutOrder, UserAddress } from "../Checkout/types";
import { cardClass } from "../Checkout/ui";
import { buttonClass, EmptyState, SkeletonBlock } from "../Profile/ui/ProfileCard";
import { Shopping_Cart_Empty } from "../SVGS";
import { useThemeStore } from "../ThemeController";
import useIsClient from "../utils/useIsClient";
import Addresses from "./Address/Addresses";

const SHELL = {
  step: "shipping",
  title: "آدرس و روش ارسال",
  back: { href: "/cart/checkout", label: "بازگشت به سبد خرید" },
} as const;

function ShippingSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <SkeletonBlock className="h-64 rounded-tile" />
        <SkeletonBlock className="h-56 rounded-tile" />
      </div>
      <SkeletonBlock className="h-96 rounded-tile" />
    </div>
  );
}

function resolveAddressId(
  picked: string | null,
  order: CheckoutOrder | null,
  addresses: UserAddress[]
) {
  const ids = new Set(addresses.map((address) => address.id));
  if (picked && ids.has(picked)) return picked;
  if (order?.addressId && ids.has(order.addressId)) return order.addressId;
  return addresses[0]?.id ?? null;
}

function payHint(hasAddress: boolean, hasMethod: boolean) {
  if (!hasAddress) return "برای پرداخت، ابتدا آدرس تحویل را ثبت کنید.";
  if (!hasMethod) return "برای پرداخت، روش ارسال را انتخاب کنید.";
  return "پرداخت از طریق درگاه امن زیبال انجام می‌شود.";
}

export default function Shipping() {
  const isClient = useIsClient();
  const methodGroup = useId();
  const utils = trpc.useUtils();
  const [pickedAddressId, setPickedAddressId] = useState<string | null>(null);

  const orderQuery = trpc.order.getActiveOrder.useQuery(undefined, { retry: false });
  const hasOrder = orderQuery.data?.result === "ok";
  const addressesQuery = trpc.shipping.userAddress.useQuery(undefined, { enabled: hasOrder });
  const methodsQuery = trpc.shipping.methods.useQuery(undefined, { enabled: hasOrder });

  const view = orderQuery.data;
  const order = view?.activeOrder ?? null;
  const addresses = addressesQuery.data?.addresses ?? [];
  const methods = methodsQuery.data?.methods ?? [];
  const selectedAddressId = resolveAddressId(pickedAddressId, order, addresses);

  const selectShipping = trpc.order.selectShipping.useMutation({
    onSuccess: (next) => utils.order.getActiveOrder.setData(undefined, next),
    onError: (err) => toast.error(readCheckoutError(err.message)),
  });

  const createPayment = trpc.payment.createPayment.useMutation({
    onSuccess: (result) => {
      if (result.pay_link) {
        window.location.assign(result.pay_link);
        return;
      }
      toast.error(result.error ?? "اتصال به درگاه پرداخت ناموفق بود.");
      utils.order.getActiveOrder.invalidate();
    },
    onError: (err) => toast.error(readCheckoutError(err.message)),
  });

  if (!isClient || orderQuery.isLoading) {
    return (
      <CheckoutShell {...SHELL}>
        <ShippingSkeleton />
      </CheckoutShell>
    );
  }

  if (orderQuery.error?.data?.code === "UNAUTHORIZED") {
    return (
      <CheckoutShell {...SHELL}>
        <EmptyState
          icon={<TruckIcon className="h-7 w-7" />}
          title="برای ادامه وارد حساب کاربری شوید"
          description="پس از ورود، آدرس و روش ارسال را انتخاب می‌کنید."
          action={
            <button
              type="button"
              onClick={() => useThemeStore.setState({ openAuthModal: true })}
              className={buttonClass("primary")}
            >
              ورود | عضویت
            </button>
          }
        />
      </CheckoutShell>
    );
  }

  if (orderQuery.error) {
    return (
      <CheckoutShell {...SHELL}>
        <EmptyState
          icon={<TruckIcon className="h-7 w-7" />}
          title="دریافت اطلاعات سفارش ناموفق بود"
          action={
            <button
              type="button"
              onClick={() => orderQuery.refetch()}
              className={buttonClass("secondary")}
            >
              تلاش دوباره
            </button>
          }
        />
      </CheckoutShell>
    );
  }

  if (!order || !view?.price || !order.items.length) {
    return (
      <CheckoutShell {...SHELL}>
        <EmptyState
          icon={<Shopping_Cart_Empty classname="w-9" />}
          title="سبد خرید شما خالی است"
          description="برای انتخاب آدرس و ارسال، ابتدا کالایی به سبد اضافه کنید."
          action={
            <Link href="/cart/checkout" className={buttonClass("primary")}>
              بازگشت به سبد خرید
            </Link>
          }
        />
      </CheckoutShell>
    );
  }

  const pricing = view.price;
  const hasMethod = Boolean(order.shippingPartnerId);
  const isPaying = createPayment.isPending || Boolean(createPayment.data?.pay_link);
  const canPay = Boolean(selectedAddressId) && hasMethod && !selectShipping.isPending;

  const saveShipping = (addressId: string, shippingPartnerId: string) =>
    selectShipping.mutateAsync({ addressId, shippingPartnerId }).catch(() => null);

  const handleAddressSelect = (addressId: string) => {
    setPickedAddressId(addressId);
    if (order.shippingPartnerId) saveShipping(addressId, order.shippingPartnerId);
  };

  const handleMethodSelect = (shippingPartnerId: string) => {
    if (selectedAddressId) saveShipping(selectedAddressId, shippingPartnerId);
  };

  const pay = async () => {
    if (!selectedAddressId || !order.shippingPartnerId) return;
    if (order.addressId !== selectedAddressId) {
      const saved = await saveShipping(selectedAddressId, order.shippingPartnerId);
      if (!saved) return;
    }
    createPayment.mutate({ orderId: order.id });
  };

  return (
    <CheckoutShell {...SHELL}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Addresses
            addresses={addresses}
            isLoading={addressesQuery.isLoading}
            selectedAddressId={selectedAddressId}
            onSelect={handleAddressSelect}
          />

          <section
            aria-labelledby={`${methodGroup}-title`}
            aria-busy={selectShipping.isPending}
            className={classNames(cardClass, "flex flex-col gap-5")}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush-100 text-mauve-700">
                <TruckIcon className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <h2 id={`${methodGroup}-title`} className="text-h3-md font-medium text-plum-900">
                  روش ارسال
                </h2>
                {!selectedAddressId && !addressesQuery.isLoading ? (
                  <p className="text-caption text-lightBlack">ابتدا آدرس تحویل را ثبت کنید.</p>
                ) : null}
              </div>
            </div>

            {methodsQuery.isLoading ? (
              <div className="flex flex-col gap-3">
                <SkeletonBlock className="h-20 rounded-tile" />
                <SkeletonBlock className="h-20 rounded-tile" />
                <SkeletonBlock className="h-20 rounded-tile" />
              </div>
            ) : methods.length ? (
              <div role="radiogroup" aria-labelledby={`${methodGroup}-title`} className="flex flex-col gap-3">
                {methods.map((method) => (
                  <ShippingMethodCard
                    key={method.id}
                    method={method}
                    groupName={methodGroup}
                    isSelected={method.id === order.shippingPartnerId}
                    isFree={pricing.isFreeShipping}
                    disabled={!selectedAddressId || selectShipping.isPending}
                    onSelect={handleMethodSelect}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-card bg-ivory px-4 py-5 text-center text-small text-lightBlack">
                در حال حاضر روش ارسالی فعال نیست. لطفاً بعداً دوباره سر بزنید.
              </p>
            )}
          </section>
        </div>

        <OrderSummary
          step="shipping"
          pricing={pricing}
          itemCount={countItems(order.items)}
          someItemsShipFree={order.items.some((item) => item.freeShipping)}
          notice={view.notice}
          isUpdating={selectShipping.isPending}
          extras={
            <>
              <ItemsPreview items={order.items} />
              <CouponForm coupon={order.coupon} isGuest={false} />
            </>
          }
        >
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={pay}
              disabled={!canPay || isPaying}
              className={buttonClass("primary", "w-full")}
            >
              {isPaying ? "در حال انتقال به درگاه…" : "پرداخت و ثبت سفارش"}
            </button>
            <p className="text-center text-caption text-lightBlack">
              {payHint(Boolean(selectedAddressId), hasMethod)}
            </p>
          </div>
        </OrderSummary>
      </div>
    </CheckoutShell>
  );
}
