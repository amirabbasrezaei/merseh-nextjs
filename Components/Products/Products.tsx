"use client";
import { trpc } from "@/utils/trpc";

import React, { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCard";

import Filter from "./Filter";

import ProductCardSkeleton from "../Product/ProductCardSkeleton";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export type filterTypeArgs = {
  categoryId?: number;
  searchTerm?: string;
  parentCategories?: number[];
};

export default function Products() {
  const [filter, setFilter] = useState<filterTypeArgs>({});
  const params = useSearchParams();
  console.log(params);
  const {
    mutate: mutate,
    data,
    isPending,
  } = trpc.filter.filterProduct.useMutation({});

  useEffect(() => {
    const timeOut = setTimeout(() => {
      mutate({
        categoryId: filter.categoryId || Number(params.get("catId")),
        searchTerm: filter.searchTerm,
      });
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [filter, params]);

  return (
    <section className="flex flex-row w-full mt-10 px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="basis-9/12 flex flex-col gap-4 items-center justify-center">
        <div className="md:grid grid-cols-4 flex-row gap-4">
          <AnimatePresence mode="wait">
            {data?.length && !isPending
              ? // @ts-ignore
                data.map((pr, index) => (
                  <ProductCard
                    key={index}
                    imageNames={pr.imageNames}
                    price={pr.price || 0}
                    title={pr.name}
                    pathname={`product/${String(pr.id)}`}
                    isLoading={true}
                  />
                ))
              : Array.from(Array(8)).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
