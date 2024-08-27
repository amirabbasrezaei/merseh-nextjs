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
      <div>
        <Image
          alt={imageUrl.split("/").at(-1)?.split(".").at(0) || ""}
          src={imageUrl}
          width={300}
          height={300}
        />
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </Link>
  );
}
