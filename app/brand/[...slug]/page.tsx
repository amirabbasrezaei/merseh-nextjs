import BrandProducts from "@/Components/Brand/BrandProducts";
import Layout from "@/Components/Layout/Layout";
import { toPathSlug } from "@/utils/slug";
import axios from "axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React, { cache } from "react";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

function apiBase() {
  return process.env.NODE_ENV === "production"
    ? process.env.BASE_URL
    : "http://localhost:3000";
}

const getBrand = cache(async (brandId: string) => {
  try {
    const { data } = await axios.get(
      `${apiBase()}/api/trpc/brand.info?input=${encodeURIComponent(
        JSON.stringify({ id: Number(brandId) })
      )}`
    );
    return data?.result?.data?.brand ?? null;
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
