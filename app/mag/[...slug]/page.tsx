import Article from "@/Components/Mag/Article";
import MagLayout from "@/Components/Layout/MagLayout";
import { getArticleController } from "@/server/Controllers/article.controller";
import { authedPageContext } from "@/server/pageContext";
import React, { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME } from "@/utils/site";

import { WithContext, Article as ArticleSchema } from "schema-dts";

export const revalidate = 3600;

export type NextPagePropsType = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getArticle = cache(async (articleId: string) => {
  const id = Number(articleId);
  if (!Number.isFinite(id)) return null;

  try {
    return await getArticleController({
      input: { articleId: id },
      ctx: await authedPageContext(),
    });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug[0]);
  if (article?.article) {
    if (article.article.isPreview) {
      return {
        title: { absolute: "پیش‌نمایش — " + article.article.title },
        robots: { index: false, follow: false },
      };
    }
    return {
      title: { absolute: article.article.title },
      alternates: {
        canonical: `${process.env.BASE_URL}/mag/${slug[0]}/${(
          article.article.englishTitle || article.article.title
        )?.replaceAll(" ", "-")}`,
      },
      description: article.article.metaDescription,

      openGraph: {
        images: article.article.imageUrls[0],
        type: "article",
        url: `${process.env.BASE_URL}/mag/${slug[0]}/${(
          article.article.englishTitle || article.article.title
        )?.replaceAll(" ", "-")}`,
        description: article.article.metaDescription ?? undefined,
        locale: "fa_IR",
        title: { absolute: article.article.title },
        publishedTime: new Date(article.article.created_at).toISOString(),
        phoneNumbers: "+982191694827",
      },
    };
  }
  return {};
}

export default async function page({ params }: NextPagePropsType) {
  const { slug } = await params;
  const article = await getArticle(slug[0]);

  if (!article?.article) {
    notFound();
  }

  const wordCount = () => {
    let counter = 0;
    article.article?.content
      ?.filter(
        (e: any) => e.type === "p" && e.childs.length && e.childs[0].type === "#text"
      )
      .map((p: any) => {
        counter += ((p?.childs[0]?.content as string) || "").split(" ").length;
      });
    return counter;
  };

  const jsonLd: WithContext<ArticleSchema> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${process.env.BASE_URL}/mag/${article.article.id}/${(
      article.article.englishTitle || article.article.title
    ).replaceAll(" ", "-")}`,
    name: article.article.title,
    image: {
      "@type": "ImageObject",
      url: article.article.imageUrls[0],
      width: "1200",
      height: "800",
    },
    description: article.article.metaDescription ?? undefined,
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
    datePublished: new Date(article.article.created_at).toISOString(),
    dateCreated: new Date(article.article.created_at).toISOString(),
    dateModified: article.article.updated_at
      ? new Date(article.article.updated_at).toISOString()
      : undefined,
    publisher: {
      "@type": "HealthAndBeautyBusiness",
      name: `مجله ${SITE_NAME}`,
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_FILES_ENDPOINT}/main_images/merseh_mag.png`,
        width: "207",
        height: "36",
      },
    },
  };

  return (
    <MagLayout>
      {article.article.isPreview ? (
        <div className="w-full bg-amber-100 text-amber-900 text-center py-2 text-sm font-medium mb-4">
          پیش‌نمایش — این مقاله منتشر نشده است (فقط ادمین)
        </div>
      ) : null}
      <Article articleId={Number(slug[0])} articleData={article} />
      {!article.article.isPreview ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </MagLayout>
  );
}
