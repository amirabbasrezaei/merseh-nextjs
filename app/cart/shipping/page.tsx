import Layout from "@/Components/Layout/Layout";
import Shipping from "@/Components/Shipping/Shipping";
import { Metadata } from "next";
import React from "react";

export function generateMetadata(): Metadata {
  return {
    title: "انتخاب آدرس",
    alternates: {
      canonical: `${process.env.BASE_URL}/cart/shipping`,
    },
  };
}

export default function page() {
  return (
    <Layout footer={false}>
      <Shipping />
    </Layout>
  );
}
