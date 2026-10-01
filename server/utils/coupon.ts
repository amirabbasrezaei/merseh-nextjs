import type { Coupon } from "@/generated/prisma/client";

type CouponRules = Pick<
  Coupon,
  "isActive" | "expiresAt" | "minSubtotal" | "usageLimit" | "usedCount"
>;

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function couponRejection(
  coupon: CouponRules | null,
  subtotal: number,
  now: Date = new Date()
): string | null {
  if (!coupon) return "کد تخفیف معتبر نیست.";
  if (!coupon.isActive) return "این کد تخفیف غیرفعال است.";
  if (coupon.expiresAt && coupon.expiresAt <= now) {
    return "مهلت استفاده از این کد تخفیف تمام شده است.";
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "ظرفیت استفاده از این کد تخفیف تکمیل شده است.";
  }
  if (coupon.minSubtotal !== null && subtotal < coupon.minSubtotal) {
    return `این کد برای سبد خرید بالای ${coupon.minSubtotal.toLocaleString("fa-IR")} تومان است.`;
  }
  return null;
}
