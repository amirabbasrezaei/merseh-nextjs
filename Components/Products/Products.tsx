"use client";
import { trpc } from "@/utils/trpc";

import React, { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCard";

import Filter from "./Filter";

import ProductCardSkeleton from "../Product/ProductCardSkeleton";
import { AnimatePresence } from "framer-motion";

export type filterTypeArgs = {
  categoryId?: string;
  searchTerm?: string;
};

export default function Products() {
  const [filter, setFilter] = useState<filterTypeArgs>({
    categoryId: "",
    searchTerm: "",
  });

  
  const {
    mutate: mutate,
    data,
    isPending,
  } = trpc.product.filterProduct.useMutation({});

  useEffect(() => {

    mutate({
      categoryId: String(filter.categoryId),
      searchTerm: filter.searchTerm,
    });
  }, [filter]);

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
                  key={pr.id}
                  imageNames={pr.imageNames}
                    price={pr.price}
                    title={pr.name}
                    pathname={`product/${String(pr.id)}`}
                    isLoading={true}
                  />
                ))
              : Array.from(Array(8)).map((_,i) => <ProductCardSkeleton key={i} />)}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
