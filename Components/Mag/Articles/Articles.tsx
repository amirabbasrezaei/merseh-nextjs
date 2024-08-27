"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import ArticleCard from "./ArticleCard";

export default function Articles() {
  const { data: articlesData, isLoading } = trpc.article.articles.useQuery();
  return (
    <section>
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
                  .slice(0, 20)
                  .join(" ") + "..." || ""
              }
              title={article.title}
              articleId={article.id}
            />
          ))
        : null}
    </section>
  );
}
