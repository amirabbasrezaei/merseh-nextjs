"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import classNames from "classnames";
import ProductTile, { type ProductTileData } from "../Product/ProductTile";

type Props = {
  products: ProductTileData[];
  isLoading: boolean;
  isRefreshing: boolean;
  searchTerm: string;
};

const gridClass =
  "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5";
const tileSizes =
  "(max-width: 639px) 45vw, (max-width: 1023px) 30vw, (max-width: 1279px) 23vw, 260px";
const SKELETON_COUNT = 10;

function TileSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      <div className="aspect-square animate-pulse rounded-tile bg-blush-100/70" />
      <div className="flex flex-col gap-2 px-1 pt-4">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-blush-100" />
        <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-blush-100" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-blush-100/80" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className={gridClass}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <TileSkeleton key={index} />
      ))}
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  isRefreshing,
  searchTerm,
}: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  if (isLoading) return <ProductGridSkeleton />;

  if (!products.length) {
    const remaining = new URLSearchParams(params.toString());
    remaining.delete("searchTerm");
    const query = remaining.toString();
    const clearSearchHref = query ? `${pathname}?${query}` : pathname;

    return (
      <div className="flex flex-col items-center gap-3 rounded-panel bg-ivory px-6 py-16 text-center">
        <p className="text-h3-md text-plum-900">
          {searchTerm
            ? `کالایی با «${searchTerm}» در این دسته‌بندی پیدا نشد`
            : "فعلاً کالایی در این دسته‌بندی نیست"}
        </p>
        {searchTerm ? (
          <Link
            href={clearSearchHref}
            scroll={false}
            className="home-focus rounded-full bg-white px-5 py-2.5 text-small font-medium text-plum-900 ring-1 ring-hairline transition-colors hover:bg-blush-100 hover:ring-mauve-400"
          >
            پاک کردن جستجو
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div
      aria-busy={isRefreshing || undefined}
      className={classNames(
        gridClass,
        "transition-opacity duration-300",
        isRefreshing && "opacity-60",
      )}
    >
      {products.map((product) => (
        <ProductTile key={product.id} product={product} sizes={tileSizes} />
      ))}
    </div>
  );
}
