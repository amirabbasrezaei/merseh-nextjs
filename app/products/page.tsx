import Layout from "@/Components/Layout/Layout";
import Products from "@/Components/Products/Products";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function page() {
  return (
    <Layout>
      <Products />
    </Layout>
  );
}
