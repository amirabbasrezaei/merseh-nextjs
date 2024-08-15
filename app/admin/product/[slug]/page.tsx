import ProductEdit from "@/Components/Admin/AddProduct/ProductEdit";
import Layout from "@/Components/Layout/Layout";
import React from "react";

interface Props {
  params: { slug: string };
}

export default function page({ params }: Props) {
  return (
    <Layout footer={false} header={false}>
      <ProductEdit productId={params.slug} />
    </Layout>
  );
}
