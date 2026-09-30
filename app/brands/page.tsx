import BrandList from "@/Components/Brand/BrandList";
import Layout from "@/Components/Layout/Layout";
import { Metadata } from "next";
import React from "react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "برندها" },
  alternates: {
    canonical: `${process.env.BASE_URL}/brands`,
  },
  description: "برندهای فروشگاه مرسه",
};

export default function page() {
  return (
    <Layout>
      <BrandList />
    </Layout>
  );
}
