"use client";
import { trpc } from "@/utils/trpc";
import React, { useRef } from "react";
import Content from "../Admin/AddProduct/ContentViewer";
import Image from "next/image";
import Comments from "./Comments/Comments";

interface Props {
  articleId: number;
}

export default function Article({ articleId }: Props) {
  const commentsRef = useRef(null);
  const { data } = trpc.article.getArticle.useQuery({ articleId });
  return (
    <section className="flex flex-col md:gap-10 gap-5 w-full  md:px-5">
      <div className="w-full flex items-center justify-center">
        <div className="flex flex-col-reverse md:flex-row justify-center  h-full items-end gap-5">
          <div className="basis-1/3 h-full flex flex-col gap-4 justify-center items-center md:pb-14">
            <h1 className="text-[25px] font-[600]">{data?.article?.title}</h1>
            <span className="text-[#8c8c8c] text-[13px]">
              {new Date(data?.article?.created_at || 0).toLocaleDateString(
                "fa-IR"
              )}
            </span>
          </div>
          <div className="">
            <Image
              alt={data?.article?.title || ""}
              src={data?.article?.imageUrls[0] || ""}
              width={700}
              height={450}
              quality={80}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="md:w-[80%] w-full max-w-[1000px] flex flex-col gap-10">
          <Content contentForView={data?.article?.content} />
          <Comments commentsRef={commentsRef} articleId={articleId} />
        </div>
      </div>
              
      
    </section>
  );
}
