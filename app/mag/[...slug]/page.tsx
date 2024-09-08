import Article from "@/Components/Mag/Article";
import MagLayout from "@/Components/Layout/MagLayout";
import React, { cache, useEffect } from "react";
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

  const wordCount = () => {
    let counter = 0;
    article.article.content
      .filter((e: any) => e.type === "p" && e.childs[0].type === "#text")
      .map((p: any) => {
        counter += ((p?.childs[0]?.content as string) || "").split(" ").length;
      });
    return counter;
  };

  const jsonLd: WithContext<ArticleSchema> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${process.env.BASE_URL}/mag/${
      article.article.id
    }/${article.article.title.replaceAll(" ", "-")}`,
    name: article.article.title,
    image: {
      "@type": "ImageObject",
      url: article.article.imageUrls[0],
      width: "1200",
      height: "800",
    },
    description: article.article.metaDescription,
    author: {
      "@type": "Person",
      name: "امیرعباس رضائی",
    },
    editor: {
      "@type": "Person",
      name: "امیرعباس رضائی",
    },
    wordCount: wordCount(),
    headline: article.article.title,
    datePublished: article.article.created_at,
    dateCreated: article.article.created_at,
    dateModified: article.article.updated_at,
    publisher: {
      "@type": "HealthAndBeautyBusiness",
      name: "مجله مرسه",
      logo: {
        "@type": "ImageObject",
        url: "https://static.merseh.ir/main_images/merseh_mag.png",
        width: "207",
        height: "36",
      },
    },
  };


  return (
    <MagLayout>
      <Article  articleId={Number(params.slug[0])} articleData={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </MagLayout>
  );
}
