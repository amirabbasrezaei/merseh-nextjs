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

export default function page() {
  return (
    <Layout>
      <Products />
    </Layout>
  );
}

export const revalidate = 120;
