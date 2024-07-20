"use client";
import { trpc } from "@/utils/trpc";

import React, { useEffect, useState } from "react";
import ProductCard from "../Product/ProductCard";

import Filter from "./Filter";

import ProductCardSkeleton from "../Product/ProductCardSkeleton";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ContentViewer } from "../Admin/AddProduct/ContentViewer";
import { contentType } from "../Admin/AddProduct/QuillEditor";

export type filterTypeArgs = {
  categoryId?: number;
  searchTerm?: string;
  parentCategories?: number[];
};

interface Props {
  categoryId: number;
}

export default function Products({ categoryId }: Props) {
  const [filter, setFilter] = useState<filterTypeArgs>({});
  const params = useSearchParams();
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

  // useEffect(() => {
  //   if (data?.categoryInfo) {
  //     setContent(JSON.parse(data?.categoryInfo.content));
  //   }
  // }, [data]);

  return (
    <section className="flex sm:gap-0 gap-5 flex-col sm:flex-row w-full mt-4 sm:mt-10 sm:px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="flex flex-col h-full w-sm:basis-9/12">
        <div className="w-full min-h-[500px] flex flex-col gap-4 items-center ">
          <div className="sm:grid grid-cols-4 flex flex-col gap-4 w-full ">
            <AnimatePresence mode="sync">
              {data?.products?.length && !isLoading
                ? data.products.map((pr, index) => (
                    <ProductCard
                      key={index}
                      imageNames={pr.imageNames}
                      price={pr.price || 0}
                      title={pr.name}
                      pathname={`product/${String(pr.id)}/${pr.name.replaceAll(
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
        <h1 className="text-[20px] text-[#595959] font-[500]">
          {data?.categoryInfo?.title}
        </h1>
        <ContentViewer contentForView={data?.categoryInfo?.content} />
      </div>
    </section>
  );
}
