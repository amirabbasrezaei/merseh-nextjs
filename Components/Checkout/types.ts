import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type CheckoutOrder = NonNullable<
  RouterOutputs["order"]["getActiveOrder"]["activeOrder"]
>;

export type CheckoutCoupon = NonNullable<CheckoutOrder["coupon"]>;

export type ShippingMethod =
  RouterOutputs["shipping"]["methods"]["methods"][number];

export type UserAddress = NonNullable<
  RouterOutputs["shipping"]["userAddress"]["addresses"]
>[number];

export type PaymentStatus =
  RouterOutputs["payment"]["inquiryPayment"]["paymentStatus"];
