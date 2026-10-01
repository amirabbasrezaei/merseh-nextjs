"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { inferRouterOutputs } from "@trpc/server";
import { trpc } from "@/utils/trpc";
import type { AppRouter } from "@/server/routers/_app";
import type { ProductTileData } from "../Product/ProductTile";
import CategoryContent from "./CategoryContent";
import CategoryHero from "./CategoryHero";
import ListingToolbar from "./ListingToolbar";
import ProductGrid, { ProductGridSkeleton } from "./ProductGrid";
import SubcategoryChips from "./SubcategoryChips";
import { findCategoryPath } from "./categoryTree";
import { parseSort, sortProducts } from "./sortProducts";

export type CategoryInfo = {
  title?: string;
  imageUrl?: string;
  content?: string;
};

type ListedProduct =
  inferRouterOutputs<AppRouter>["filter"]["filterProduct"]["products"][number];

type Props = {
  categoryId: number;
  category?: CategoryInfo | null;
};

const shellClass = "flex w-full flex-col gap-8 sm:px-6 md:gap-10";

function toTile(product: ListedProduct): ProductTileData {
  return {
    id: product.id,
    name: product.name,
    price: product.price ?? 0,
    discount: product.discount ?? 0,
    freeShipping: product.freeShipping,
    imageUrl: product.imageUrls[0] ?? "",
    imageNames: product.imageUrls,
    brand: product.brand,
  };
}

/** Server-renderable stand-in shown while the search-param driven listing hydrates. */
export function ProductsFallback({ category }: { category?: CategoryInfo | null }) {
  return (
    <div className={shellClass}>
      <CategoryHero
        title={category?.title ?? ""}
        imageUrl={category?.imageUrl}
        path={[]}
        count={null}
      />
      <ProductGridSkeleton />
      {category?.content ? <CategoryContent content={category.content} /> : null}
    </div>
  );
}

export default function Products({ categoryId, category }: Props) {
  const params = useSearchParams();
  const searchTerm = params.get("searchTerm")?.trim() ?? "";
  const sort = parseSort(params.get("sort"));

  const { data: tree } = trpc.product.categories.useQuery();
  const { mutate, data, isError, isPending } =
    trpc.filter.filterProduct.useMutation();

  useEffect(() => {
    mutate({ categoryId, searchTerm });
  }, [categoryId, searchTerm, mutate]);

  const path = useMemo(
    () => findCategoryPath(tree, categoryId),
    [tree, categoryId],
  );
  const current = path.at(-1);
  const chipsParent = current?.subCategories?.length ? current : path.at(-2);

  const products = useMemo(
    () => sortProducts((data?.products ?? []).map(toTile), sort),
    [data, sort],
  );

  const title =
    category?.title ?? current?.title ?? data?.categoryInfo.title ?? "";

  return (
    <div className={shellClass}>
      <CategoryHero
        title={title}
        imageUrl={category?.imageUrl || current?.imageUrl}
        path={path}
        count={data ? products.length : null}
      />

      {chipsParent ? (
        <SubcategoryChips
          parent={chipsParent}
          items={chipsParent.subCategories ?? []}
          activeId={categoryId}
        />
      ) : null}

      <section aria-label="فهرست کالاها" className="flex flex-col gap-6">
        <ListingToolbar searchTerm={searchTerm} sort={sort} />
        <ProductGrid
          products={products}
          isLoading={!data && !isError}
          isRefreshing={isPending && Boolean(data)}
          searchTerm={searchTerm}
        />
      </section>

      {category?.content ? <CategoryContent content={category.content} /> : null}
    </div>
  );
}
