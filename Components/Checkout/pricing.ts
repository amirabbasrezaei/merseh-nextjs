import type { CartItem, CartPricing } from "../stores/shoppingCartStore";

/** Display-only totals for a guest cart; the server prices every real order. */
export function estimatePricing(items: CartItem[]): CartPricing {
  const subtotal = items.reduce((sum, item) => {
    const discount = Math.min(Math.max(item.discount ?? 0, 0), item.price);
    return sum + (item.price - discount) * item.numberOfProduct;
  }, 0);
  const allItemsShipFree =
    items.length > 0 && items.every((item) => item.freeShipping);

  return {
    subtotal,
    couponDiscount: 0,
    productTotal: subtotal,
    allItemsShipFree,
    isFreeShipping: allItemsShipFree,
    shippingPrice: null,
    shippingCharge: null,
    payable: subtotal,
  };
}

export function countItems(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.numberOfProduct, 0);
}
