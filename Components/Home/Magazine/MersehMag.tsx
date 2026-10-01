"use client";

import { trpc } from "@/utils/trpc";
import ArticleRow from "./ArticleRow";
import FeaturedArticle from "./FeaturedArticle";
import type { HomeArticle } from "./articleMeta";
import SectionHeader from "../ui/SectionHeader";
import { SITE_NAME } from "@/utils/site";

const gridClass =
  "grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16";

function MagazineSkeleton() {
  return (
    <div className="flex flex-col gap-10" aria-hidden>
      <div className="flex flex-col gap-3 border-b border-hairline pb-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-blush-200" />
        <div className="h-8 w-44 animate-pulse rounded-full bg-blush-200" />
      </div>
      <div className={gridClass}>
        <div className="aspect-[16/9] animate-pulse rounded-panel bg-blush-100" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-card bg-blush-100 md:h-28"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MersehMag() {
  const { data, isLoading } = trpc.article.recentArticles.useQuery();
  const articles: HomeArticle[] = data?.recentArticles ?? [];

  if (isLoading) return <MagazineSkeleton />;
  if (!articles.length) return null;

  const [featured, ...rest] = articles;
  if (!featured) return null;

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <SectionHeader
        id="home-magazine"
        eyebrow="راهنمای زیبایی"
        title={`مجله ${SITE_NAME}`}
        href="/mag"
        linkLabel="همه مقالات"
      />
      <div className={gridClass}>
        <FeaturedArticle article={featured} />
        {rest.length ? (
          <div className="flex flex-col">
            {rest.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
