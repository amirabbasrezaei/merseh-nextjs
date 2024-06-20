import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { trpc } from "@/utils/trpc";
import axios from "axios";
import { Metadata, NextPage } from "next";
import { cache } from "react";

export const revalidate = 3600;

export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getProduct = cache(async (productId: string) => {
  const { data } = await axios.get(
    `${process.env.BASE_URL}/api/trpc/product.getproduct?input={"productId":${productId}}`
  );
  return data.result.data;
});

export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (product?.product) {
    return {
      title: product.product.name,
      description:
        product.product.content
          .filter((e: any) => e.type === "text")[0]
          ?.content.toString() || "",
      openGraph: {
        images: product.product.imageUrls.map((e: any) => ({
          url: e,
        })),
      },
    };
  }
  return {};
}

export default function Page({ params }: NextPagePropsType) {
  return (
    <Layout>
      <Product productId={params.slug} />
    </Layout>
  );
}
