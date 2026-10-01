import splitNumber from "../utils/splitNumber";
import type { CheckoutCoupon } from "./types";

export function describeCoupon(coupon: CheckoutCoupon) {
  switch (coupon.type) {
    case "FREE_SHIPPING":
      return "ارسال رایگان";
    case "PERCENT":
      return `${coupon.value}٪ تخفیف روی کالاها`;
    case "FIXED":
      return `${splitNumber(coupon.value)} تومان تخفیف روی کالاها`;
  }
}

export function isLoginError(message: string | undefined) {
  if (!message?.startsWith("{")) return false;
  try {
    return Boolean(JSON.parse(message).need_login_now);
  } catch {
    return false;
  }
}

/** Auth errors arrive as JSON and validation errors as a Zod issue list. */
export function readCheckoutError(
  message: string | undefined,
  fallback = "خطایی رخ داد. دوباره تلاش کنید."
) {
  if (!message) return fallback;
  if (message.startsWith("{")) return "برای ادامه وارد حساب کاربری شوید.";
  if (message.startsWith("[")) return fallback;
  return message;
}
