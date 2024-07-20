import Layout from "@/Components/Layout/Layout";
import Products from "@/Components/Products/Products";
import axios from "axios";
import { Metadata } from "next";
import React, { cache } from "react";

export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getCategory = cache(async (categoryId: string) => {
  const { data } = await axios.get(
    `${
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000"
    }/api/trpc/product.categoryInfo?input={"categoryId":${categoryId}}`
  );
  console.log(data.result.data);
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
  const category = await getCategory(params.slug[0]);
  if (category?.category) {
    return {
      title: category.category.title,
      alternates: {
        canonical: `${process.env.BASE_URL}/category/${params.slug[0]}/${(
          category.category.title as string
        ).replaceAll(" ", "-")}`,
      },
      openGraph: {
        images: category.category.imageUrl,
        type: "article",
        url: `${process.env.BASE_URL}/category/${params.slug[0]}/${(
          category.category.title as string
        ).replaceAll(" ", "-")}`,
      },
    };
  }
  return {};
}

export default function page({ params }: any) {
  return (
    <Layout>
      <Products categoryId={Number(params.slug[0])} />
    </Layout>
  );
}

export const revalidate = 120;
