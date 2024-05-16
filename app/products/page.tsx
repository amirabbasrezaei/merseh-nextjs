import Layout from "@/Components/Layout/Layout";
import Products from "@/Components/Products/Products";
import React from "react";

export default function page() {
  return (
    <Layout>
      <Products />
    </Layout>
  );
}

export const revalidate = 600