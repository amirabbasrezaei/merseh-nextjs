import Layout from "@/Components/Layout/Layout";
import Products from "@/Components/Products/Products";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "محصولات",
  alternates: {
    canonical: `${process.env.BASE_URL}/products`,
  },
};

export default function page({ params }: any) {
  return (
    <Layout>
      <Products categoryId={Number(params.slug[0])} />
    </Layout>
  );
}

export const revalidate = 120;
