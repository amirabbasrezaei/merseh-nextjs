import ManageCategory from "@/Components/Admin/Category/ManageCategory";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ManageCategory categoryId={slug} />;
}
