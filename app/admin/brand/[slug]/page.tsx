import ManageBrand from "@/Components/Admin/Brand/ManageBrand";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ManageBrand brandId={slug} />;
}
