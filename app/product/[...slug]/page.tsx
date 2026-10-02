import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { Product as ProductSchema, WithContext } from "schema-dts";
import { getProductController } from "@/server/Controllers/product.controller";
import { authedPageContext } from "@/server/pageContext";
import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { SITE_NAME } from "@/utils/site";

export const revalidate = 3600;

export type NextPagePropsType = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getProduct = cache(async (productId: string) => {
  const id = Number(productId);
  if (!Number.isFinite(id)) return null;

  try {
    return await getProductController({
      input: { productId: id },
      ctx: await authedPageContext(),
    });
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
        name: `فروشگاه ${SITE_NAME}`,
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
