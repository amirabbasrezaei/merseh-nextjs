"use client";

import { toPathSlug } from "@/utils/slug";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function BrandList() {
  const { data, isLoading } = trpc.brand.listActive.useQuery();
  const brands = data?.brands ?? [];

  return (
    <section className="mt-4 flex w-full flex-col gap-6 sm:px-10">
      <h1 className="text-[28px] font-semibold text-black1">برندها</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : brands.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.id}/${toPathSlug(brand.name)}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-[#EDEDED] p-5 transition-colors hover:border-[#00A573]"
            >
              <div className="relative h-16 w-16">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt=""
                    fill
                    quality={70}
                    className="object-contain"
                    sizes="64px"
                  />
                ) : null}
              </div>
              <span className="text-center text-sm font-medium text-black1">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-[#8a8a8a]">
          هنوز برندی ثبت نشده است.
        </p>
      )}
    </section>
  );
}
