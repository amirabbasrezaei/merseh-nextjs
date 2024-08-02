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
      href={`${
        process.env.NODE_ENV === "production"
          ? process.env.BASE_URL
          : "http://localhost:3000"
      }/mag/${articleId}/${title.replaceAll(" ", "-")}`}
    >
      <Image
        width={200}
        height={200}
        alt={imageUrl.split("/").at(-1) || ""}
        src={imageUrl}
      />
    </Link>
  );
}
