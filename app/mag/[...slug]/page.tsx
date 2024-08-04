import Article from "@/Components/Mag/Article";
import Layout from "@/Components/Layout/Layout";
import MagLayout from "@/Components/Layout/MagLayout";
import React, { cache } from "react";
import axios from "axios";
import { Metadata } from "next";

export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getArticle = cache(async (articleId: string) => {
  const { data } = await axios.get(
    `${
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000"
    }/api/trpc/article.getArticle?input={"articleId":${articleId}}`
  );
  return data.result.data;
});

export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const article = await getArticle(params.slug[0]);
  if (article?.article) {
    return {
      title: article.article.title,
      alternates: {
        canonical: `${process.env.BASE_URL}/mag/${params.slug[0]}/${(
          article.article.title as string
        )?.replaceAll(" ", "-")}`,
      },
      description: article.article.metaDescription,

      openGraph: {
        images: article.article.imageUrls[0],
        type: "article",
        url: `${process.env.BASE_URL}/mag/${params.slug[0]}/${(
          article.article.title as string
        )?.replaceAll(" ", "-")}`,
        description: article.article.metaDescription,
        locale: "fa_IR",
        title: article.article.title,
        authors: "مرسه",
        publishedTime: article.article.created_at,
        siteName: "مرسه",
        phoneNumbers: "+982191694827",
      },
      other: {
        currency: "IRT",
      },
    };
  }
  return {};
}

export default function page({ params }: NextPagePropsType) {
  return (
    <MagLayout>
      <Article articleId={Number(params.slug[0])} />
    </MagLayout>
  );
}
