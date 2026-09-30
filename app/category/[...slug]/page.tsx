import Layout from "@/Components/Layout/Layout";
import Products from "@/Components/Products/Products";

import axios from "axios";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React, { cache } from "react";

export type NextPagePropsType = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 3600;

const getCategory = cache(async (categoryId: string) => {
  const { data } = await axios.get(
    `${
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000"
    }/api/trpc/product.categoryInfo?input={"categoryId":${categoryId}}`
  );
  return data.result.data;
});

// export const metadata: Metadata = {
//   title: "محصولات",
//   alternates: {
//     canonical: `${process.env.BASE_URL}/category`,
//   },
// };



export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug[0]);
  if (category?.category) {
    return {
      title: { absolute: `قیمت ${category.category.title}` },
      alternates: {
        canonical: `${process.env.BASE_URL}/category/${slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
      description: category.category.metaDescription,
      openGraph: {
        images: category.category.imageUrl,
        type: "article",
        url: `${process.env.BASE_URL}/category/${slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
    };
  }
  return {};
}

export default async function page({ params }: NextPagePropsType) {
  const { slug } = await params;
  const category = await getCategory(slug[0]);
  return (
    <Layout>
      <Products
        categoryContent={category?.category}
        categoryId={Number(slug[0])}
      />
    </Layout>
  );
}

