import Layout from "@/Components/Layout/Layout";
import Profile from "@/Components/Profile/Profile";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata({ params }: any): Promise<Metadata> {
  return {
    title: params.slug === "orders" ? "سفارش ها" : "",
    alternates: {
      canonical: `${process.env.BASE_URL}/${params.slug}`,
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
