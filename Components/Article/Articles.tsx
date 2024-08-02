"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import ArticleCard from "./ArticleCard";

export default function Articles() {
  const { data } = trpc.article.articles.useQuery();
  return (
    <section>
      {data?.articles?.length
        ? data.articles.map((article) => (
            <ArticleCard
              short_content={JSON.parse(article.content)}
              title={article.title}
              imageUrl={article.images[0]}
              articleId={article.id}
            />
          ))
        : null}
    </section>
  );
}
