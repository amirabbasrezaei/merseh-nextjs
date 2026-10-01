"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import CartLineItem from "../Checkout/CartLineItem";
import CheckoutShell from "../Checkout/CheckoutShell";
import CouponForm from "../Checkout/CouponForm";
import { ArrowIcon } from "../Checkout/icons";
import OrderSummary from "../Checkout/OrderSummary";
import { countItems, estimatePricing } from "../Checkout/pricing";
import { cardClass } from "../Checkout/ui";
import { buttonClass, EmptyState, SkeletonBlock } from "../Profile/ui/ProfileCard";
import { Shopping_Cart_Empty } from "../SVGS";
import { useThemeStore } from "../ThemeController";
import useShoppingCart from "../useShoppingCart";
import useIsClient from "../utils/useIsClient";

function CartSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className={`${cardClass} flex flex-col gap-5`}>
        {[0, 1].map((key) => (
          <div key={key} className="flex gap-4">
            <SkeletonBlock className="h-24 w-24 sm:h-28 sm:w-28" />
            <div className="flex flex-1 flex-col gap-3">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="mt-auto h-10 w-32 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <SkeletonBlock className="h-80 rounded-tile" />
    </div>
  );
}

export default function Checkout() {
  const isClient = useIsClient();
  const { data: account, isPending: isAccountPending } =
    trpc.user.userInfo.useQuery(undefined, { retry: false });
  const {
    items,
    price,
    isUpdating,
    orderView,
    syncCart,
    incrementProductNumber,
    decrementProductNumber,
    removeProductFromOrder,
  } = useShoppingCart();

  const pushedGuestCart = useRef(false);
  useEffect(() => {
    if (pushedGuestCart.current) return;
    if (!account || orderView?.result !== "no_order" || !items.length) return;
    pushedGuestCart.current = true;
    syncCart();
  }, [account, orderView?.result, items.length, syncCart]);

  const itemCount = countItems(items);
  const isGuest = !account;

  if (!isClient || isAccountPending) {
    return (
      <CheckoutShell step="cart" title="سبد خرید">
        <CartSkeleton />
      </CheckoutShell>
    );
  }

  if (!items.length) {
    return (
      <CheckoutShell step="cart" title="سبد خرید">
        <EmptyState
          icon={<Shopping_Cart_Empty classname="w-9" />}
          title="سبد خرید شما خالی است"
          description="محصولات دلخواهتان را به سبد اضافه کنید تا اینجا نمایش داده شوند."
          action={
            <Link href="/products" className={buttonClass("primary")}>
              مشاهده محصولات
            </Link>
          }
        />
      </CheckoutShell>
    );
  }

  const pricing = (!isGuest && price) || estimatePricing(items);

  return (
    <CheckoutShell step="cart" title="سبد خرید" meta={`${itemCount} کالا`}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className={cardClass}>
          <ul className="flex flex-col divide-y divide-hairline">
            {items.map((item) => (
              <CartLineItem
                key={`${item.productId}-${item.variationValueId ?? "base"}`}
                item={item}
                onIncrement={() =>
                  incrementProductNumber(item.variationValueId, item.productId)
                }
                onDecrement={() =>
                  decrementProductNumber(item.variationValueId, item.productId)
                }
                onRemove={() =>
                  removeProductFromOrder(item.variationValueId, item.productId)
                }
              />
            ))}
          </ul>
        </div>

        <OrderSummary
          step="cart"
          pricing={pricing}
          itemCount={itemCount}
          someItemsShipFree={items.some((item) => item.freeShipping)}
          notice={orderView?.notice}
          isUpdating={isUpdating}
          extras={
            <CouponForm
              coupon={orderView?.activeOrder?.coupon ?? null}
              isGuest={isGuest}
            />
          }
        >
          {isGuest ? (
            <button
              type="button"
              onClick={() => useThemeStore.setState({ openAuthModal: true })}
              className={buttonClass("primary", "w-full")}
            >
              ورود و ادامه خرید
            </button>
          ) : (
            <Link
              href="/cart/shipping"
              aria-disabled={isUpdating}
              className={buttonClass(
                "primary",
                "w-full aria-disabled:pointer-events-none aria-disabled:bg-mauve-400"
              )}
            >
              ادامه و انتخاب آدرس
              <ArrowIcon className="h-4 w-4 rotate-180" />
            </Link>
          )}
        </OrderSummary>
      </div>
    </CheckoutShell>
  );
}
