import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { Product as ProductSchema, WithContext } from "schema-dts";
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
    `${
      process.env.NODE_ENV === "production" || true
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

    const availability =
      variation && variationValue
        ? variationValue.instock
          ? "instock"
          : "outofstock"
        : product.product.instock
        ? "instock"
        : "outofstock";

    return {
      title: { absolute: " قیمت و خرید" + " " + product.product.name },

      description: product.product.metaDescription,
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

export default async function Page({
  params,
  searchParams,
}: NextPagePropsType) {
  const product = await getProduct(params.slug[0]);

  const variation = product.product?.variations.find(
    (vr: any) => vr.id == searchParams.variation
  );

  const variationValue = variation?.variations?.find(
    (value: any) => value.id == searchParams.variationValue
  );
  
  const jsonLd: WithContext<ProductSchema> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${process.env.BASE_URL}/product/${
      product.product.id
    }/${product.product.name.replaceAll(" ", "-")}`,
    name: " قیمت و خرید" + " " + product.product.name,
    image: product.product.imageUrls[0],
    description: product.product.metaDescription,
    countryOfOrigin: "IRAN",
    brand: "merseh",
    url: `${process.env.BASE_URL}/product/${
      product.product.id
    }/${product.product.name.replaceAll(" ", "-")}`,
    productID: product.product.id,
    offers: {
      "@type": "AggregateOffer",
      name: product.product.name,
      priceCurrency: "IRR",
      availability:
        variation && variationValue
          ? variationValue.instock
            ? "InStock"
            : "OutOfStock"
          : product.product.instock
          ? "InStock"
          : "OutOfStock",
      price:
        variation && variationValue
          ? (variationValue.price - variationValue.discount) * 10
          : (product.product.price - product.product.discount) * 10,
      lowPrice:
        variation && variationValue
          ? (variationValue.price - variationValue.discount) * 10
          : (product.product.price - product.product.discount) * 10,
      offerCount: variation?.variations.length || 1,
      url: `${process.env.BASE_URL}/product/${
        product.product.id
      }/${product.product.name.replaceAll(" ", "-")}`,
      seller: {
        "@type": "HealthAndBeautyBusiness",
        url: process.env.BASE_URL,
        name: "فروشگاه مرسه",
      },
    },
  };

  return (
    <Layout>
      <Product productData={product} productId={params.slug[0]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Layout>
  );

}