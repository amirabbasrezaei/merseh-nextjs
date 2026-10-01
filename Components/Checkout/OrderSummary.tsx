import classNames from "classnames";
import type { ReactNode } from "react";
import type { CartPricing } from "../stores/shoppingCartStore";
import Price from "./Price";

type Props = {
  step: "cart" | "shipping";
  pricing: CartPricing;
  itemCount: number;
  someItemsShipFree: boolean;
  notice?: string | null;
  isUpdating?: boolean;
  /** Rendered above the totals, e.g. the coupon field. */
  extras?: ReactNode;
  children: ReactNode;
};

function SummaryRow({
  label,
  children,
  accent = false,
}: {
  label: ReactNode;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-lightBlack">{label}</dt>
      <dd className={classNames("text-end", accent ? "text-mauve-700" : "text-plum-900")}>
        {children}
      </dd>
    </div>
  );
}

function ShippingValue({
  step,
  pricing,
}: {
  step: Props["step"];
  pricing: CartPricing;
}) {
  if (pricing.isFreeShipping) {
    return (
      <span className="inline-flex items-center gap-2">
        {pricing.shippingPrice ? (
          <Price value={pricing.shippingPrice} strike className="text-caption" />
        ) : null}
        <span className="font-medium text-mauve-700">رایگان</span>
      </span>
    );
  }
  if (pricing.shippingCharge !== null) return <Price value={pricing.shippingCharge} />;
  return (
    <span className="text-caption text-lightBlack">
      {step === "cart" ? "در مرحله بعد انتخاب می‌شود" : "روش ارسال را انتخاب کنید"}
    </span>
  );
}

function shippingNote(pricing: CartPricing, someItemsShipFree: boolean) {
  if (pricing.allItemsShipFree) return "همه کالاهای این سفارش ارسال رایگان دارند.";
  if (pricing.isFreeShipping) return null;
  if (someItemsShipFree) {
    return "ارسال رایگان فقط وقتی اعمال می‌شود که همه کالاهای سبد ارسال رایگان داشته باشند.";
  }
  return null;
}

export default function OrderSummary({
  step,
  pricing,
  itemCount,
  someItemsShipFree,
  notice,
  isUpdating = false,
  extras,
  children,
}: Props) {
  const note = shippingNote(pricing, someItemsShipFree);
  const shippingPending = pricing.shippingCharge === null && !pricing.isFreeShipping;

  return (
    <aside
      aria-labelledby="order-summary-title"
      aria-busy={isUpdating}
      className="flex flex-col gap-5 rounded-tile border border-hairline bg-white p-5 shadow-card sm:p-6 lg:sticky lg:top-28"
    >
      <h2 id="order-summary-title" className="text-h3-md font-medium text-plum-900">
        خلاصه سفارش
      </h2>

      {notice ? (
        <p role="status" className="rounded-card bg-blush-100 px-4 py-3 text-small text-mauve-700">
          {notice}
        </p>
      ) : null}

      {extras}

      <dl
        className={classNames(
          "home-motion flex flex-col gap-3 text-small",
          isUpdating && "opacity-60"
        )}
      >
        <SummaryRow label={`مبلغ کالاها (${itemCount} عدد)`}>
          <Price value={pricing.subtotal} />
        </SummaryRow>
        {pricing.couponDiscount > 0 ? (
          <SummaryRow label="تخفیف کد" accent>
            <span className="inline-flex items-baseline gap-0.5">
              −<Price value={pricing.couponDiscount} />
            </span>
          </SummaryRow>
        ) : null}
        <SummaryRow label="هزینه ارسال">
          <ShippingValue step={step} pricing={pricing} />
        </SummaryRow>
      </dl>

      {note ? (
        <p className="rounded-card bg-ivory px-4 py-3 text-caption text-lightBlack">{note}</p>
      ) : null}

      <div
        className={classNames(
          "home-motion flex items-end justify-between gap-3 border-t border-dashed border-hairline pt-4",
          isUpdating && "opacity-60"
        )}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-small font-medium text-plum-900">مبلغ قابل پرداخت</span>
          {shippingPending ? (
            <span className="text-caption text-lightBlack">بدون هزینه ارسال</span>
          ) : null}
        </div>
        <Price value={pricing.payable} className="text-h2 text-plum-900" />
      </div>

      {children}
    </aside>
  );
}
