"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import ArticleCard from "./ArticleCard";

export default function Articles() {
  const { data: articlesData, isLoading } = trpc.article.articles.useQuery();
  return (
    <section className="flex flex-col w-full  items-center md:px-10">
      <h1 className="font-[500] my-5">خواندنی های مجله مرسه</h1>
      <div className="grid  grid-cols-1 grid-rows-none xl:grid-cols-2 gap-8  md:gap-14   justify-between w-full">
        {articlesData?.articles?.length
          ? articlesData.articles.map((article) => (
              <ArticleCard
                imageUrl={article.images[0]}
                key={article.id}
                description={
                  (
                    (JSON.parse(article.content).filter(
                      (e: any) => e.type === "p" && e.childs[0].type === "#text"
                    )[0]?.childs[0]?.content as string) || ""
                  )
                    .split(" ")
                    .slice(0, 25)
                    .join(" ") + "..." || ""
                }
                title={article.title}
                articleId={article.id}
              />
            ))
          : null}
      </div>
    </section>
  );
}
