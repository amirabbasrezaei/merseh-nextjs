import BrandProducts from "@/Components/Brand/BrandProducts";
import Layout from "@/Components/Layout/Layout";
import { brandInfoController } from "@/server/Controllers/brand.controller";
import { pageContext } from "@/server/pageContext";
import { toPathSlug } from "@/utils/slug";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { cache } from "react";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const getBrand = cache(async (brandId: string) => {
  const id = Number(brandId);
  if (!Number.isInteger(id)) return null;

  try {
    const { brand } = await brandInfoController({
      input: { id },
      ctx: pageContext(),
    });
    return brand;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug[0]);
  if (!brand) return {};
  const path = `/brand/${brand.id}/${toPathSlug(brand.name)}`;
  return {
    title: { absolute: brand.name },
    description: brand.metaDescription || brand.content,
    alternates: {
      canonical: `${process.env.BASE_URL}${path}`,
    },
    openGraph: {
      images: brand.logoUrl || undefined,
      url: `${process.env.BASE_URL}${path}`,
    },
  };
}

export default async function page({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrand(slug[0]);
  if (!brand) notFound();

  return (
    <Layout>
      <BrandProducts brand={brand} />
    </Layout>
  );
}
