"use client";

import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import { Shape1_SVG } from "../SVGS";
import SectionHeader from "./ui/SectionHeader";

function MagazineSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="h-6 w-32 animate-pulse rounded-card bg-hover1" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-card bg-white p-4 shadow-card"
          >
            <div className="h-4 w-2/3 animate-pulse rounded-card bg-hover1" />
            <div className="h-[120px] w-[120px] shrink-0 animate-pulse rounded-tile bg-hover1 md:h-[160px] md:w-[160px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MersehMag() {
  const { data, isLoading } = trpc.article.recentArticles.useQuery();
  const articles = data?.recentArticles ?? [];

  if (isLoading) return <MagazineSkeleton />;
  if (!articles.length) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div
        aria-hidden
        className="home-enter pointer-events-none absolute -bottom-10 end-0 hidden w-[min(100%,720px)] lg:block"
      >
        <Shape1_SVG classname="h-auto w-full fill-green2" />
      </div>
      <div className="relative z-10 flex flex-col gap-6">
        <SectionHeader id="home-magazine" title="مجله مرسه" href="/mag" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {articles.map((article) => {
            const image = article.images?.[0];
            return (
              <Link
                key={article.id}
                href={`/mag/${article.id}/${(article.englishTitle || article.title).replaceAll(" ", "-")}`}
                className="home-focus home-motion flex items-center justify-between gap-4 rounded-card bg-white p-4 shadow-card"
              >
                <h3 className="line-clamp-2 text-h3 text-black1 md:text-h3-md">
                  {article.title}
                </h3>
                {image ? (
                  <Image
                    className="h-[120px] w-[120px] shrink-0 rounded-tile object-cover md:h-[160px] md:w-[160px]"
                    alt=""
                    src={image}
                    width={160}
                    height={160}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
