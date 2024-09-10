"use client";
import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Filter from "./Filter";
import { ContentViewer } from "../Admin/AddProduct/ContentViewer";

export type filterTypeArgs = {
  categoryId?: number;
  searchTerm?: string;
  parentCategories?: number[];
  needRefetch?: boolean;
  categoryName?: string;
};

interface Props {
  categoryId: number;
  categoryContent: any;
}
export const revalidate = 300;

const ProductCard = dynamic(() => import("../Product/ProductCard"), {
  ssr: false,
});

const ProductCardSkeleton = dynamic(
  () => import("../Product/ProductCardSkeleton"),
  {
    ssr: false,
  }
);



export default function Products({ categoryId, categoryContent }: Props) {
  const [filter, setFilter] = useState<filterTypeArgs>({
    categoryId,
    needRefetch: false,
  });
  const params = useSearchParams();
  const router = useRouter();

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

  useEffect(() => {
    if (data) {
      setFilter((state) => ({
        ...state,
        parentCategories: data.categoryInfo.categoryParents,
      }));
    }
  }, [data]);

  console.log(categoryContent?.content)

  return (
    <section className="flex sm:gap-14 gap-5 flex-col sm:flex-row w-full mt-4 sm:px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="flex flex-col h-full sm:basis-9/12">
        <div className="h-fit mb-5 flex items-center jus w-full">
          {data?.categoryInfo?.title ? (
            <h1 className="text-[18px] text-gray-500 font-[500]  mb-[10px] ">
              قیمت {data.categoryInfo.title}
            </h1>
          ) : (
            <div className="bg-gray-100 rounded-[5px] mb-[10px] h-8 w-[200px] animate-pulse" />
          )}
        </div>
        <div className="w-full min-h-[800px] flex flex-col gap-4 items-center ">
          <div className="sm:grid lg:grid-cols-3  flex flex-col gap-4 w-full ">
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
          </div>
        </div>
        <hr className="mt-5 border-[#ececec] mb-10" />

        {categoryContent?.content !== undefined ? (
          <div className="[&_h2]:text-[17px] text-[13px] [&_ul]:list-disc [&_ul]:list-inside [&_a]:text-[#7ba79a]  text-[#a8a8a8] [&_h2]:text-[#7f7f7f]   leading-loose [&_h3]:text-[#969696] [&_h3]:text-[15px] flex flex-col">
            <ContentViewer contentForView={JSON.parse(categoryContent?.content)} />
          </div>
        ) : (
          Array.from(Array(4)).map((_, i) => (
            <motion.div className="flex flex-col gap-3 my-5" key={i}>
              <div className="bg-gray-100 w-[150px] h-[26px] rounded-[7px] animate-pulse"></div>
              <div className="bg-gray-100 w-full h-[20px] rounded-[4px] animate-pulse"></div>
              <div className="bg-gray-100 w-full h-[20px] rounded-[4px] animate-pulse"></div>
              <div className="bg-gray-100 w-full h-[20px] rounded-[4px] animate-pulse"></div>
              <div className="bg-gray-100 w-full h-[20px] rounded-[4px] animate-pulse"></div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
