import ProductEdit from "@/Components/Admin/AddProduct/ProductEdit";
import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function page({ params }: Props) {
  const { slug } = await params;
  return <ProductEdit productId={slug} />;
}
