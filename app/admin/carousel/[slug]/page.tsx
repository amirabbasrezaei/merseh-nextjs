import ManageCarousel from "@/Components/Admin/Carousel/ManageCarousel";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ManageCarousel carouselId={slug} />;
}
