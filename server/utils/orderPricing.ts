import type { CouponType } from "@/generated/prisma/client";

export type PricedProduct = {
  price: number;
  discount: number;
  freeShipping: boolean;
};

export type PricedVariationValue = {
  price: number;
  discount: number;
};

export type PricedOrderLine = {
  numberOfproduct: number;
  Product: PricedProduct;
  ProductVariationValue: PricedVariationValue | null;
};

export type PricedCoupon = {
  type: CouponType;
  value: number;
};

export type OrderPricing = {
  subtotal: number;
  couponDiscount: number;
  productTotal: number;
  allItemsShipFree: boolean;
  isFreeShipping: boolean;
  shippingPrice: number | null;
  shippingCharge: number | null;
  payable: number;
};

export function unitPriceOf(line: PricedOrderLine) {
  const source = line.ProductVariationValue ?? line.Product;
  const discount = Math.min(Math.max(source.discount, 0), source.price);
  return {
    listPrice: source.price,
    discount,
    payable: source.price - discount,
  };
}

export function lineTotalOf(line: PricedOrderLine) {
  return unitPriceOf(line).payable * line.numberOfproduct;
}

export function subtotalOf(lines: PricedOrderLine[]) {
  return lines.reduce((sum, line) => sum + lineTotalOf(line), 0);
}

export function couponDiscountOf(
  coupon: PricedCoupon | null,
  subtotal: number
) {
  if (!coupon) return 0;
  switch (coupon.type) {
    case "PERCENT":
      return Math.min(Math.floor((subtotal * coupon.value) / 100), subtotal);
    case "FIXED":
      return Math.min(coupon.value, subtotal);
    case "FREE_SHIPPING":
      return 0;
  }
}

export function priceOrder({
  lines,
  coupon,
  shippingPrice,
}: {
  lines: PricedOrderLine[];
  coupon: PricedCoupon | null;
  shippingPrice: number | null;
}): OrderPricing {
  const subtotal = subtotalOf(lines);
  const couponDiscount = couponDiscountOf(coupon, subtotal);
  const productTotal = subtotal - couponDiscount;
  const allItemsShipFree =
    lines.length > 0 && lines.every((line) => line.Product.freeShipping);
  const isFreeShipping =
    allItemsShipFree || coupon?.type === "FREE_SHIPPING";
  const shippingCharge =
    shippingPrice === null ? null : isFreeShipping ? 0 : shippingPrice;

  return {
    subtotal,
    couponDiscount,
    productTotal,
    allItemsShipFree,
    isFreeShipping,
    shippingPrice,
    shippingCharge,
    payable: productTotal + (shippingCharge ?? 0),
  };
}
