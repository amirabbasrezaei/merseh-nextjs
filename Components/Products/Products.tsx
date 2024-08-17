"use client";
import { trpc } from "@/utils/trpc";

import React, { useEffect, useState } from "react";
import Filter from "./Filter";

import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { contentType } from "../Admin/AddProduct/QuillEditor";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

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
  const ProductCard = dynamic(() => import("../Product/ProductCard"), {
    ssr: false,
  });
  const ProductCardSkeleton = dynamic(
    () => import("../Product/ProductCardSkeleton"),
    {
      ssr: false,
    }
  );
  const ContentViewer = dynamic(
    () => import("../Admin/AddProduct/ContentViewer"),
    {
      ssr: false,
    }
  );
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

  useEffect(() => {
    if (data) {
      setFilter((state) => ({
        ...state,
        parentCategories: data.categoryInfo.categoryParents,
      }));
    }
  }, [data]);

  return (
    <section className="flex sm:gap-14 gap-5 flex-col sm:flex-row w-full mt-4 sm:px-10 overflow-visible">
      <Filter filter={filter} setFilter={setFilter} />
      <div className="flex flex-col h-full w-sm:basis-9/12">
        <div className="h-fit mb-5 flex items-center jus w-full">
          {data?.categoryInfo?.title ? (
            <h1 className="text-[18px] text-gray-500 font-[500]  mb-[10px] ">
              قیمت {data.categoryInfo.title}
            </h1>
          ) : (
            <div />
          )}
        </div>
        <div className="w-full min-h-[800px] flex flex-col gap-4 items-center ">
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
        <hr className="mt-5 border-[#ececec] mb-10" />

        <div className="[&_h2]:text-[17px] text-[13px] [&_ul]:list-disc [&_ul]:list-inside [&_a]:text-[#7ba79a]  text-[#a8a8a8] [&_h2]:text-[#7f7f7f]   leading-loose [&_h3]:text-[#969696] [&_h3]:text-[15px] flex flex-col">
          {data?.categoryInfo?.content ? (
            <ContentViewer contentForView={data?.categoryInfo?.content} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
