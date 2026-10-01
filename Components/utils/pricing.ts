export function getPriceInfo(price: number, discount: number) {
  const safeDiscount = Math.max(discount, 0);
  const payable = Math.max(price - safeDiscount, 0);
  const percent = price > 0 ? Math.round((safeDiscount / price) * 100) : 0;
  const hasDiscount = safeDiscount > 0 && price > 0;
  return { payable, percent, hasDiscount };
}
