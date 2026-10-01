import { getPriceInfo } from "../utils/pricing";
import type { ProductTileData } from "../Product/ProductTile";

export const SORT_OPTIONS = [
  { value: "recommended", label: "پیشنهادی" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "recommended";

export function parseSort(value: string | null): SortValue {
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortValue)
    : DEFAULT_SORT;
}

export function sortProducts(
  products: ProductTileData[],
  sort: SortValue,
): ProductTileData[] {
  if (sort === DEFAULT_SORT) return products;

  const priced = products.map((product) => ({
    product,
    ...getPriceInfo(product.price, product.discount ?? 0),
  }));

  priced.sort((a, b) => {
    if (sort === "cheapest") return a.payable - b.payable;
    if (sort === "expensive") return b.payable - a.payable;
    return b.percent - a.percent;
  });

  return priced.map(({ product }) => product);
}
