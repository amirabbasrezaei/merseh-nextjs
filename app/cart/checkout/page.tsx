import Checkout from "@/Components/Cart/Checkout";
import Layout from "@/Components/Layout/Layout";
import { Metadata } from "next";

import React from "react";

export function generateMetadata():Metadata{
  return{
    title:"سبد خرید"
  }
}

export default function page(props: any) {
  return (
    <Layout footer={false}>
      <Checkout />
    </Layout>
  );
}
