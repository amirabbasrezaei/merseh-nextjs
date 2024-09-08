import Layout from "@/Components/Layout/Layout";

import axios from "axios";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import React, { cache } from "react";

export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
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

const Products = dynamic(() => import("@/Components/Products/Products"), {
  ssr: false,
});

export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const category = await getCategory(params.slug[0]);
  if (category?.category) {
    return {
      title: { absolute: `قیمت ${category.category.title}` },
      alternates: {
        canonical: `${process.env.BASE_URL}/category/${params.slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
      description: category.category.metaDescription,
      openGraph: {
        images: category.category.imageUrl,
        type: "article",
        url: `${process.env.BASE_URL}/category/${params.slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
    };
  }
  return {};
}

export default async function page({ params }: any) {
  const category = await getCategory(params.slug[0]);
  return (
    <Layout>
      <Products
        categoryContent={category?.category}
        categoryId={Number(params.slug[0])}
      />
    </Layout>
  );
}
