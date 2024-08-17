import { trpc } from "@/utils/trpc";
import React from "react";
import { motion } from "framer-motion";
import Item from "./Item";

export default function Articles() {
  const { data, isLoading } = trpc.article.sitemapArticle.useQuery();
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.articles?.length
            ? data.articles.map((article) => (
                <Item
                key={article.id}
                  title={article.title}
                  id={String(article.id)}
                  section="article"
                  commentCount={article.comments?.length}
                />
              ))
            : null}
        </div>
      )}
    </motion.div>
  );
}
