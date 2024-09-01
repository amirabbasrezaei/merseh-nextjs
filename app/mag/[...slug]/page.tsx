import Article from "@/Components/Mag/Article";
import MagLayout from "@/Components/Layout/MagLayout";
import React, { cache } from "react";
import axios from "axios";
import { Metadata } from "next";

import { WithContext, Article as ArticleSchema } from "schema-dts";

export const revalidate = 3600;

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
      title: { absolute: article.article.title },
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
        title: { absolute: article.article.title },
        publishedTime: article.article.created_at,
        phoneNumbers: "+982191694827",
      },
      other: {
        currency: "IRT",
      },
    };
  }
  return {};
}

export default async function page({ params }: NextPagePropsType) {
  const article = await getArticle(params.slug[0]);

  const jsonLd: WithContext<ArticleSchema> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${process.env.BASE_URL}/mag/${
      article.article.id
    }/${article.article.title.replaceAll(" ", "-")}` ,
    name: article.article.title,
    image: article.article.imageUrls[0],
    description: article.article.metaDescription,
    author: "مرسه",
    headline: article.article.title,
    datePublished: article.article.created_at,

    
  };
  return (
    <MagLayout>
      <Article articleId={Number(params.slug[0])} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </MagLayout>
  );
}
