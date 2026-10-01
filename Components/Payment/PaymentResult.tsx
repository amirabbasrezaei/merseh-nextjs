"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { CheckIcon, CloseIcon } from "../Checkout/icons";
import type { PaymentStatus } from "../Checkout/types";
import { buttonClass } from "../Profile/ui/ProfileCard";
import { useShoppingCartStore } from "../stores/shoppingCartStore";

type Outcome = "checking" | "paid" | "failed" | "unknown" | "missing";

type ResultCopy = {
  icon: ReactNode;
  title: string;
  description: string;
  actions: ReactNode;
};

const failedActions = (
  <>
    <Link href="/cart/shipping" className={buttonClass("primary", "w-full sm:w-auto")}>
      تلاش دوباره
    </Link>
    <Link href="/cart/checkout" className={buttonClass("secondary", "w-full sm:w-auto")}>
      بازگشت به سبد خرید
    </Link>
  </>
);

const COPY: Record<Exclude<Outcome, "checking">, ResultCopy> = {
  paid: {
    icon: <CheckIcon className="h-9 w-9" />,
    title: "پرداخت با موفقیت انجام شد",
    description: "سفارش شما ثبت شد و به‌زودی برای ارسال آماده می‌شود.",
    actions: (
      <>
        <Link href="/profile/orders" className={buttonClass("primary", "w-full sm:w-auto")}>
          مشاهده سفارش‌ها
        </Link>
        <Link href="/" className={buttonClass("secondary", "w-full sm:w-auto")}>
          بازگشت به فروشگاه
        </Link>
      </>
    ),
  },
  failed: {
    icon: <CloseIcon className="h-9 w-9" />,
    title: "پرداخت انجام نشد",
    description:
      "سفارش شما هنوز در سبد خرید است. اگر مبلغی از حسابتان کسر شده باشد، حداکثر تا ۷۲ ساعت بازگردانده می‌شود.",
    actions: failedActions,
  },
  unknown: {
    icon: <CloseIcon className="h-9 w-9" />,
    title: "وضعیت پرداخت مشخص نیست",
    description:
      "نتیجه تراکنش هنوز تأیید نشده است. چند دقیقه بعد بخش سفارش‌ها را بررسی کنید یا دوباره تلاش کنید.",
    actions: failedActions,
  },
  missing: {
    icon: <CloseIcon className="h-9 w-9" />,
    title: "اطلاعات پرداخت یافت نشد",
    description: "برای پرداخت سفارش، از سبد خرید اقدام کنید.",
    actions: (
      <>
        <Link href="/cart/checkout" className={buttonClass("primary", "w-full sm:w-auto")}>
          رفتن به سبد خرید
        </Link>
        <Link href="/" className={buttonClass("secondary", "w-full sm:w-auto")}>
          بازگشت به فروشگاه
        </Link>
      </>
    ),
  },
};

const OUTCOME_BY_STATUS: Record<PaymentStatus, Outcome> = {
  PAYED: "paid",
  FAILED: "failed",
  WAITING: "unknown",
  UNKNOWN: "unknown",
};

export default function PaymentResult({ trackId }: { trackId: string | null }) {
  const utils = trpc.useUtils();
  const clearShoppingCart = useShoppingCartStore((s) => s.clearShoppingCart);
  const { mutateAsync: inquire } = trpc.payment.inquiryPayment.useMutation();
  const [status, setStatus] = useState<PaymentStatus | null>(null);

  // Strict Mode remounts detach the mutation observer, so the result is kept in local state.
  const requested = useRef(false);
  useEffect(() => {
    if (!trackId || requested.current) return;
    requested.current = true;
    inquire({ track_id: trackId })
      .then(({ paymentStatus }) => {
        setStatus(paymentStatus);
        if (paymentStatus !== "PAYED") return;
        clearShoppingCart();
        utils.order.getActiveOrder.invalidate();
      })
      .catch(() => setStatus("FAILED"));
  }, [trackId, inquire, clearShoppingCart, utils]);

  const outcome: Outcome = !trackId
    ? "missing"
    : status
      ? OUTCOME_BY_STATUS[status]
      : "checking";

  return (
    <div className="flex w-full justify-center py-6 sm:py-12">
      <section
        aria-live="polite"
        aria-busy={outcome === "checking"}
        className="flex w-full max-w-lg flex-col items-center gap-6 rounded-panel border border-hairline bg-white px-6 py-10 text-center shadow-float sm:px-10 sm:py-12"
      >
        {outcome === "checking" ? (
          <>
            <span className="h-16 w-16 animate-spin rounded-full border-4 border-blush-100 border-t-mauve-700" />
            <div className="flex flex-col gap-2">
              <h1 className="text-h2 text-plum-900 md:text-h2-md">در حال بررسی پرداخت</h1>
              <p className="text-small text-lightBlack">چند لحظه صبر کنید و صفحه را نبندید.</p>
            </div>
          </>
        ) : (
          <>
            <span
              className={
                outcome === "paid"
                  ? "flex h-20 w-20 items-center justify-center rounded-full bg-mauve-700 text-white shadow-raised"
                  : "flex h-20 w-20 items-center justify-center rounded-full bg-blush-100 text-mauve-700"
              }
            >
              {COPY[outcome].icon}
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-h2 text-plum-900 md:text-h2-md">{COPY[outcome].title}</h1>
              <p className="text-small leading-7 text-lightBlack">{COPY[outcome].description}</p>
            </div>
            {trackId ? (
              <dl className="flex w-full items-center justify-between gap-3 rounded-card bg-ivory px-4 py-3 text-small">
                <dt className="text-lightBlack">کد پیگیری</dt>
                <dd dir="ltr" className="font-medium text-plum-900">
                  {trackId}
                </dd>
              </dl>
            ) : null}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              {COPY[outcome].actions}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
