import Checkout from "@/Components/Cart/Checkout";
import Layout from "@/Components/Layout/Layout";
import { Metadata } from "next";

import React from "react";

export function generateMetadata(): Metadata {
  return {
    title: "سبد خرید",
    alternates: {
      canonical: `${process.env.BASE_URL}/cart/checkout`,
    },
  };
}

export default function page(props: any) {
  return (
    <Layout footer={false}>
      <Checkout />
    </Layout>
  );
}
