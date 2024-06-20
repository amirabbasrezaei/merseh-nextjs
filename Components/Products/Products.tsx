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

  const {
    mutate: mutate,
    data,
    isLoading,
  } = trpc.filter.filterProduct.useMutation({});

  useEffect(() => {
    console.log({
      categoryId: Number(params.get("catId")),
      searchTerm: params.get("searchTerm") || "",
    });
    const timeOut = setTimeout(() => {
      mutate({
        categoryId: Number(params.get("catId")),
        searchTerm: params.get("searchTerm") || "",
      });
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [params]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <section className="flex sm:gap-0 gap-5 flex-col sm:flex-row w-full mt-4 sm:mt-10 sm:px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="sm:basis-9/12 flex flex-col gap-4 items-center justify-center">
        <div className="sm:grid grid-cols-4 flex flex-col gap-4 w-full ">
          <AnimatePresence mode="sync">
            {data?.length && !isLoading 
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
