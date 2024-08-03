"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import ArticleCard from "./ArticleCard";
import SuggestedArticleCard from "./SuggestedArticleCard";
import { Medal_SVG, Text_SVG } from "../SVGS";

export default function RecentArticles() {
  const { data } = trpc.article.recentArticles.useQuery();
  console.log(data?.suggestedArticels);
  return (
    <div className="w-full h-full flex flex-row  gap-10 ">
      {/* choosen articles */}
      <div className="basis-1/2 h-full w-full flex flex-col   gap-3">
        <div className="flex flex-row items-center   mb-4 gap-2 ">
          <Medal_SVG classname="fill-[#005795] w-6 h-auto" />
          <h2 className="text-[20px] text-gray-600 font-[600] ">برگزیده‌ها</h2>
        </div>
        {data?.suggestedArticels?.at(0) ? (
          <div className=" w-full h-[400px] text-[27px] text-white font-[600]   rounded-sm">
            <SuggestedArticleCard
              href={`/mag/${
                data.suggestedArticels[0].id
              }/${data?.suggestedArticels[0].title.replaceAll(" ", "-")}`}
              image_alt={
                data.suggestedArticels[0].images[0].split("/").at(-1) || ""
              }
              title={data.suggestedArticels[0].title}
              image_src={data.suggestedArticels[0].images[0]}
            />
          </div>
        ) : (
          <div className="bg-slate-100 w-full h-[400px]   rounded-sm" />
        )}

        <div className="h-[200px] flex flex-row gap-3 w-full text-[20px] text-white font-[600]">
          {data?.suggestedArticels?.at(1) ? (
            <div className="basis-1/2 h-full bg-slate-100 rounded-sm">
              <SuggestedArticleCard
                href={`/mag/${
                  data.suggestedArticels[1].id
                }/${data?.suggestedArticels[1].title.replaceAll(" ", "-")}`}
                image_alt={
                  data.suggestedArticels[1].images[0]?.split("/").at(-1) || ""
                }
                title={data.suggestedArticels[1].title}
                image_src={data.suggestedArticels[1].images[0]}
              />
            </div>
          ) : (
            <div className="basis-1/2 h-full bg-slate-100 rounded-sm" />
          )}
          {data?.suggestedArticels?.at(2) ? (
            <div className="basis-1/2 h-full w-full bg-slate-100 rounded-sm ">
              <SuggestedArticleCard
                href={`/mag/${
                  data.suggestedArticels[2].id
                }/${data?.suggestedArticels[2].title.replaceAll(" ", "-")}`}
                image_alt={
                  data.suggestedArticels[2].images[0]?.split("/").at(-1) || ""
                }
                title={data.suggestedArticels[2].title}
                image_src={data.suggestedArticels[2].images[0]}
              />
            </div>
          ) : (
            <div className="basis-1/2 h-full w-full bg-slate-100 rounded-sm " />
          )}
        </div>
      </div>
      {/* recent articles */}
      <div className="basis-1/2 h-full w-full">
        <div className="flex flex-row items-center  gap-2 mb-4">
          <Text_SVG classname="w-7 fill-[#949e00]" />
          <h2 className="text-[20px] text-gray-600 font-[600] ">آخرین مطالب</h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-300 divide-opacity-35 ">
          {data?.recentArticles?.length
            ? data.recentArticles.map((article: any) => (
                <ArticleCard
                  short_content={
                    (
                      (JSON.parse(article.content).filter(
                        (e: any) =>
                          e.type === "p" && e.childs[0].type === "#text"
                      )[0]?.childs[0]?.content as string) || ""
                    )
                      .split(" ")
                      .slice(0, 20)
                      .join(" ") + "..." || ""
                  }
                  title={article.title}
                  imageUrl={article.images[0]}
                  articleId={article.id}
                  key={article.id}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
