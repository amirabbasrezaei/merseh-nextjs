"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import ArticleCard from "./ArticleCard";
import { motion } from "framer-motion";
export default function Articles() {
  const { data: articlesData, isLoading } = trpc.article.articles.useQuery();
  return (
    <section className="flex flex-col w-full  items-center md:px-10">
      <h1 className="font-[500] my-5">خواندنی های مجله مرسه</h1>
      <div className="grid  grid-cols-1 grid-rows-none xl:grid-cols-2 gap-8  md:gap-14   justify-between w-full">
        {articlesData?.articles?.length && !isLoading
          ? articlesData.articles.map((article) => (
              <ArticleCard
                imageUrl={article.images[0]}
                key={article.id}
                description={article.content}
                title={article.title}
                articleId={article.id}
              />
            ))
          : Array.from(Array(6)).map((_, i) => (
              <motion.div
                className="flex flex-col gap-3 my-5 animate-pulse sm:flex-row-reverse items-center w-full"
                key={i}
              >
                <div className="bg-gray-100  sm:basis-4/12 h-[170px] rounded-[7px] "></div>
                <div className="flex flex-col gap-3 sm:basis-8/12 ">
                  <div className="bg-gray-100 w-[70%] h-[30px] rounded-[4px]"></div>
                  <div className="bg-gray-100 w-full h-[20px] rounded-[4px]"></div>
                  <div className="bg-gray-100 w-full h-[20px] rounded-[4px]"></div>
                </div>
              </motion.div>
            ))}
      </div>
    </section>
  );
}
