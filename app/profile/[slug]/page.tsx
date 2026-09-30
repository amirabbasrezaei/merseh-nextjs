import Layout from "@/Components/Layout/Layout";
import Profile from "@/Components/Profile/Profile";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug === "orders" ? "سفارش ها" : "",
    alternates: {
      canonical: `${process.env.BASE_URL}/${slug}`,
    },
  };
}

export default function page() {
  return (
    <Layout footer={false}>
      <Profile />
    </Layout>
  );
}
