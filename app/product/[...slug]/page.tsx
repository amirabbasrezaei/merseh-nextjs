import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { trpc } from "@/utils/trpc";
import axios from "axios";
import { Metadata, NextPage } from "next";
import { cache } from "react";

export const revalidate = 120;

export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getProduct = cache(async (productId: string) => {
  const { data } = await axios.get(
    `${
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000"
    }/api/trpc/product.getproduct?input={"productId":${productId}}`
  );
  return data.result.data;
});

export async function generateMetadata({
  params,
  searchParams,
}: NextPagePropsType): Promise<Metadata> {
  const product = await getProduct(params.slug[0]);

  if (product?.product) {
    const variation = product.product?.variations.find(
      (vr: any) => vr.id == searchParams.variation
    );

    const variationValue = variation?.variations?.find(
      (value: any) => value.id == searchParams.variationValue
    );

    const product_id =
      variation && variationValue
        ? `${product.product.id}_${variation.id}_${variationValue.id}`
        : product.product.id;

    const product_name =
      variation && variationValue
        ? `${product.product.name} - ${variationValue.name}`
        : product.product.name;

    const product_price =
      variation && variationValue
        ? variationValue.price - variationValue.discount
        : product.product.price - product.product.discount;

    const product_old_price =
      variation && variationValue
        ? variationValue.price
        : product.product.price;

        console.log(product)

    const availability =
      variation && variationValue
        ? variationValue.instock
          ? "instock"
          : "outofstock"
        : product.product.instock
        ? "instock"
        : "outofstock";

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
      alternates: {
        canonical: `${process.env.BASE_URL}/product/${params.slug[0]}/${(
          product.product.name as string
        ).replaceAll(" ", "-")}`,
      },
      other: {
        product_id,
        product_name,
        product_price,
        product_old_price,
        availability,
      },
    };
  }
  return {};
}

export default function Page({ params }: NextPagePropsType) {
  return (
    <Layout>
      <Product productId={params.slug[0]} />
    </Layout>
  );
}
