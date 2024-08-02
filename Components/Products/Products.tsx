"use client";
import { trpc } from "@/utils/trpc";

import React, { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCard";

import Filter from "./Filter";

import ProductCardSkeleton from "../Product/ProductCardSkeleton";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Content, { ContentViewer } from "../Admin/AddProduct/ContentViewer";
import { contentType } from "../Admin/AddProduct/QuillEditor";
import { useRouter } from "next/navigation";

export type filterTypeArgs = {
  categoryId?: number;
  searchTerm?: string;
  parentCategories?: number[];
  needRefetch?: boolean;
  categoryName?: string;
};

interface Props {
  categoryId: number;
}

export default function Products({ categoryId }: Props) {
  const [filter, setFilter] = useState<filterTypeArgs>({
    categoryId,
    needRefetch: false,
  });
  const params = useSearchParams();
  const router = useRouter();
  const [content, setContent] = useState<contentType[]>([]);

  const {
    mutate: mutate,
    data,
    isLoading,
  } = trpc.filter.filterProduct.useMutation({});

  useEffect(() => {
    const timeOut = setTimeout(() => {
      mutate({
        categoryId: categoryId,
        searchTerm: params.get("searchTerm") || "",
      });
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [params]);

  useEffect(() => {
    if (filter.needRefetch) {
      setFilter((state) => ({ ...state, needRefetch: false }));
      router.push(
        `/category/${filter.categoryId}/${filter.categoryName?.replaceAll(
          " ",
          "-"
        )}`
      );
      // mutate({ categoryId: filter.categoryId });
    }
  }, [filter]);

  return (
    <section className="flex sm:gap-0 gap-5 flex-col sm:flex-row w-full mt-4 sm:mt-10 sm:px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="flex flex-col h-full w-sm:basis-9/12">
        <div className="w-full min-h-[500px] flex flex-col gap-4 items-center ">
          <div className="sm:grid grid-cols-4 flex flex-col gap-4 w-full ">
            <AnimatePresence mode="sync">
              {data?.products?.length && !isLoading
                ? data.products.map((pr: any, index: number) => (
                    <ProductCard
                      key={index}
                      imageNames={pr.imageNames}
                      price={pr.price || 0}
                      title={pr.name}
                      pathname={`/product/${String(pr.id)}/${pr.name.replaceAll(
                        " ",
                        "-"
                      )}`}
                      isLoading={true}
                    />
                  ))
                : Array.from(Array(8)).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
            </AnimatePresence>
          </div>
        </div>
        <h1 className="text-[18px] text-[#888888] font-[500] mt-[50px] mb-[10px]">
          {data?.categoryInfo?.title}
        </h1>
        <div className="[&_h2]:text-[17px] text-[13px] [&_ul]:list-disc [&_ul]:list-inside [&_a]:text-[#7ba79a]  text-[#a8a8a8] [&_h2]:text-[#7f7f7f]   leading-loose [&_h3]:text-[#969696] [&_h3]:text-[15px] flex flex-col">
          <ContentViewer contentForView={data?.categoryInfo?.content} />
        </div>
      </div>
    </section>
  );
}
