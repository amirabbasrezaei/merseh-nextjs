"use client";

import ProductCard from "@/Components/Product/ProductCard";
import ProductCardSkeleton from "@/Components/Product/ProductCardSkeleton";
import { toPathSlug } from "@/utils/slug";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type BrandInfo = {
  id: number;
  name: string;
  content: string;
  logoUrl: string | null;
};

export default function BrandProducts({ brand }: { brand: BrandInfo }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(searchTerm.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const { data, isLoading, isFetching } = trpc.brand.products.useQuery({
    brandId: brand.id,
    searchTerm: debounced,
  });

  const products = data?.products ?? [];
  const showSkeleton = isLoading || (isFetching && !data);

  return (
    <section className="mt-4 flex w-full flex-col gap-8 sm:px-10">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt=""
            width={72}
            height={72}
            quality={70}
            className="h-[72px] w-[72px] rounded-2xl object-contain"
          />
        ) : null}
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold text-black1">{brand.name}</h1>
          {brand.content ? (
            <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-[#7f7f7f]">
              {brand.content}
            </p>
          ) : null}
        </div>
      </header>

      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="جستجو در محصولات این برند"
        className="w-full max-w-md rounded-xl border border-[#EDEDED] px-4 py-2.5 text-sm text-black1 outline-none focus:border-[#00A573]"
      />

      {showSkeleton ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.name}
              imageNames={product.imageNames}
              price={product.price}
              brand={product.brand}
              pathname={`/product/${product.id}/${toPathSlug(product.name)}`}
            />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-[#8a8a8a]">
          محصولی برای این برند پیدا نشد.
        </p>
      )}
    </section>
  );
}
