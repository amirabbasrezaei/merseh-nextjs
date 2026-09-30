import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { Product as ProductSchema, WithContext } from "schema-dts";
import axios from "axios";
import { Metadata, NextPage } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export type NextPagePropsType = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getProduct = cache(async (productId: string) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const { data } = await axios.get(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.BASE_URL
          : "http://localhost:3000"
      }/api/trpc/product.getproduct?input=${encodeURIComponent(
        JSON.stringify({ productId: Number(productId) })
      )}`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
        validateStatus: (status) => status < 500,
      }
    );

    if (data?.error) {
      return null;
    }

    return data.result.data;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
  searchParams,
}: NextPagePropsType): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(slug[0]);

  if (product?.product) {
    if (product.product.isPreview) {
      return { title: { absolute: "پیش‌نمایش — " + product.product.name }, robots: { index: false, follow: false } };
    }

    const variation = product.product?.variations.find(
      (vr: any) => vr.id == resolvedSearchParams.variation
    );

    const variationValue = variation?.variations?.find(
      (value: any) => value.id == resolvedSearchParams.variationValue
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
        canonical: `${process.env.BASE_URL}/product/${slug[0]}/${(
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
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const product = await getProduct(slug[0]);

  if (!product?.product) {
    notFound();
  }

  const variation = product.product?.variations.find(
    (vr: any) => vr.id == resolvedSearchParams.variation
  );

  const variationValue = variation?.variations?.find(
    (value: any) => value.id == resolvedSearchParams.variationValue
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
    ...(product.product.brand?.isActive
      ? {
          brand: {
            "@type": "Brand" as const,
            name: product.product.brand.name,
          },
        }
      : {}),
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
      {product.product.isPreview ? (
        <div className="w-full bg-amber-100 text-amber-900 text-center py-2 text-sm font-medium">
          پیش‌نمایش — این محصول منتشر نشده است (فقط ادمین)
        </div>
      ) : null}
      <Product productData={product} productId={slug[0]} />
      {!product.product.isPreview ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Layout>
  );
}
