import Image from "next/image";
import Link from "next/link";
import React from "react";
interface Props {
  imageUrl: string;
  title: string;
  description: string;
  articleId: number;
}

export default function ArticleCard({
  articleId,
  title,
  description,
  imageUrl,
}: Props) {
  return (
    <Link href={`/mag/${articleId}/${title.replaceAll(" ", "-")}`}>
      <div className="flex flex-col sm:flex-row-reverse w-full border-b pb-8 md:pb-14 border-b-gray-100 p-5  gap-3 lg:gap-10 justify-center">
        <Image
          style={{ objectFit: "contain" }}
          className="rounded-md sm:w-[300px] lg:w-[250px]"
          alt={imageUrl.split("/").at(-1)?.split(".").at(0) || ""}
          src={imageUrl}
          width={600}
          height={400}
        />
        <div className="flex flex-col gap-3 justify-center">
          <h2 className="font-[600] text-[20px]">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}
