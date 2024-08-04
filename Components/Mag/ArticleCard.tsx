import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  short_content: string;
  imageUrl: string;
  articleId: number;
}


export default function ArticleCard({
  imageUrl,
  short_content,
  title,
  articleId,
}: Props) {
  return (
    <Link
      href={`/mag/${articleId}/${title.replaceAll(" ", "-")}`}
      className="flex flex-row items-center gap-5 justify-between py-4"
    >
      <div className="flex flex-col p-2 gap-1">
        <h2 className="font-[600] text-[20px] text-black1 hover:text-inherit">
          {title}
        </h2>
        <span className="text-[#5e5e5e]">{short_content}</span>
      </div>
      <Image
        className="w-[150px] h-[150px] rounded-md"
        width={500}
        height={500}
        style={{ objectFit: "cover" }}
        // fill={true}
        alt={imageUrl.split("/").at(-1) || ""}
        src={imageUrl}
        quality={100}
      />
    </Link>
  );
}
